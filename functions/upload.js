export async function onRequestPost(context) {
  // Confirm function is reachable:
  // return new Response("Upload function is reachable via POST!", { status: 200 });

  const token = context.env.GITHUB_TOKEN;
  if (!token) {
    return new Response("Missing GITHUB_TOKEN", { status: 500 });
  }

  const repo = "souweststrummers/website";
  const apiBase = `https://api.github.com/repos/${repo}/contents/uploads/`;

  const form = await context.request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return new Response("No file provided.", { status: 400 });
  }

  // Read file and encode
  const buffer = await file.arrayBuffer();
  const content = btoa(
    String.fromCharCode(...new Uint8Array(buffer))
  );

  // Upload to GitHub
  const response = await fetch(apiBase + encodeURIComponent(file.name), {
    method: "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Upload ${file.name}`,
      content: content,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(`GitHub API error: ${err}`, { status: 500 });
  }
  return new Response("File uploaded successfully!", { status: 200 });
}