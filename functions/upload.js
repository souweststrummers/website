// /functions/upload.js
export async function onRequestPost(context) {
  const GITHUB_TOKEN = context.env.GITHUB_TOKEN;
  const GITHUB_REPO = "souweststrummers/webupload";
  const GITHUB_API = "https://api.github.com/repos/" + GITHUB_REPO + "/contents/uploads/";

  const formData = await context.request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return new Response("File missing", { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  const uploadRes = await fetch(GITHUB_API + encodeURIComponent(file.name), {
    method: "PUT",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      message: `Upload ${file.name}`,
      content: content,
    }),
  });

  if (!uploadRes.ok) {
    const error = await uploadRes.text();
    return new Response(`GitHub upload failed: ${error}`, { status: 500 });
  }

  return new Response("File uploaded successfully!");
}

// Add "GITHUB_TOKEN" as a secret in Cloudflare Pages project settings
