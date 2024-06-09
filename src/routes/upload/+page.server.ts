import { DIRECTUS_KEY } from "$env/static/private";
import type { Actions, PageServerLoad } from "$lib/types";
import { redirect } from "sveltekit-flash-message/server";
import { route } from "$lib/ROUTES";

export const load = (async ({ locals: { user }, cookies }) => {
  // Get all data for select fields
  const reqCourse = await fetch(
    "https://platform-big-themes.directus.app/items/course"
  );
  const reqContact = await fetch(
    "https://platform-big-themes.directus.app/items/contact"
  );
  const reqTag = await fetch(
    "https://platform-big-themes.directus.app/items/tag"
  );
  const reqSubtag = await fetch(
    "https://platform-big-themes.directus.app/items/sub_tag"
  );
  const dataSubtag = await reqSubtag.json();
  const dataCourse = await reqCourse.json();
  const dataContact = await reqContact.json();
  const dataTag = await reqTag.json();

  const data = {
    course: dataCourse.data,
    contact: dataContact.data,
    sub_tag: dataSubtag.data,
    tag: dataTag.data,
  };
  if (!user) {
    throw redirect(
      route("/login"),
      {
        type: "error",
        message: "You must be logged in to view the dashboard.",
      },
      cookies
    );
  }
  return {
    data: data,
    loggedInUserName: user.name,
  };
}) satisfies PageServerLoad;

// export const load = (async ({ locals: { user }, cookies }) => {
// 	if (!user) {
// 		throw redirect(
// 			route('/login'),
// 			{
// 				type: 'error',
// 				message: 'You must be logged in to view the dashboard.'
// 			},
// 			cookies
// 		);
// 	}

// 	return {
// 		loggedInUserName: user.name,
// 	};
// }) satisfies PageServerLoad;

// Upload file to Directus files
async function uploadFile(filedata) {
  const response = await fetch(
    "https://platform-big-themes.directus.app/files",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIRECTUS_KEY}`,
      },
      body: filedata,
    }
  );

  const data = await response.json();

  return data;
}
export const actions = {
  "create-werkvorm": async ({ request }) => {
    const formData = await request.formData();
    /* ------------------------------- FILE UPLOAD ------------------------------ */
    // Get all files from formData object
    const werkvormThumbnail = formData.get("werkvormThumbnail");
    const werkvormVideo = formData.get("werkvormVideo");
    const werkvormFile = formData.getAll("werkvormFile");
    const filesToUpload = new FormData();
    const allFiles = [werkvormThumbnail, werkvormVideo];
    let subTest;

    allFiles.forEach((file) => {
      // If file size is 0, don't upload
      if (file.size === 0) {
        console.log("File size is 0");
      } else {
        // Push all files with size > 0 to filesToUpload array
        filesToUpload.append("files", file);
      }
    });
    werkvormFile.forEach((file) => {
      // If file size is 0, don't upload
      if (file.size === 0) {
        console.log("File size is 0");
      } else {
        // Push all files with size > 0 to filesToUpload array
        filesToUpload.append("files", file);
      }
    });
    console.log(werkvormFile);

    // Upload files to Directus
    const uploadData = await uploadFile(filesToUpload);

    /* -------------------------------- FORM DATA ------------------------------- */
    // Get all data from formData object
    const werkvormName = formData.get("werkvormName")?.toString();
    const werkvormShortDesc = formData.get("werkvormShortDesc")?.toString();
    const werkvormDesc = formData.get("werkvormDesc")?.toString();
    const werkvormOpleiding =
      formData.get("werkvormOpleiding")?.toString() || null;
    const werkvormContactpersoon =
      formData.get("werkvormContactpersoon")?.toString() || null;
    const werkvormSubtags = formData.getAll("selectTag") || null;
    let i = -1;

    let werkvormThumbnailDataID;
    let werkvormVideoDataID;
    let werkvormFileDataID = new Array();
    // Check if uploadData is an array
    if (Array.isArray(uploadData.data)) {
      const werkvormThumbnailID = uploadData.data.filter((file) => {
        return file.filename_download === werkvormThumbnail.name;
      });
      werkvormThumbnailDataID = werkvormThumbnailID[0].id;

      const werkvormVideoID = uploadData.data.filter((file) => {
        return file.filename_download === werkvormVideo.name;
      });
      werkvormVideoDataID = werkvormVideoID[0].id;

      werkvormFile.forEach(() => {
        i++;
        const werkvormFileID = uploadData.data.filter((file) => {
          return file.filename_download === werkvormFile[i].name;
        });
        console.log(werkvormFileID[0].id, i);
        werkvormFileDataID.push({ directus_files_id: werkvormFileID[0].id });
      });
    } else {
      werkvormThumbnailDataID = uploadData.data.id;
    }

    // Slugify werkvormName
    const slug =
      werkvormName
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "") +
      "-" +
      Date.now();
    // Send data to Directus
    const response = await fetch(
      "https://platform-big-themes.directus.app/items/workform",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DIRECTUS_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: werkvormName,
          shortDescription: werkvormShortDesc,
          description: werkvormDesc,
          course: werkvormOpleiding,
          contact: werkvormContactpersoon,
          thumbnail: werkvormThumbnailDataID,
          video: werkvormVideoDataID,
          files: werkvormFileDataID,
          link: slug,
          sub_tags: werkvormSubtags,
        }),
      }
    )
      .then((response) => response.json())
      .catch((error) => error);
    console.log(response.errors);
  },
};
