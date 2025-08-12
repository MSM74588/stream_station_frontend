import { toast } from "sonner";

export async function handleAddToFavorites({song, artist, album_art, url}) {
    try {
        const toastId = toast.loading("Adding to bookmarks...");
        // 1. Fetch image and convert to Blob
        const imageResponse = await fetch(album_art);
        const imageBlob = await imageResponse.blob();
        const contentType = imageBlob.type || "image/jpeg";

        // 2. Prepare form data
        const formData = new FormData();
        formData.append("song_name", song);
        formData.append("artist", artist);
        formData.append("url", url);
        formData.append("image", imageBlob, `thumbnail.${contentType.split("/")[1]}`);
        formData.append("thumbnail_constructor_url", process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "")

        // 3. Send POST request
        const res = await fetch(`${process.env.NEXT_PUBLIC_FAVOURITES_ENDPOINT}`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            if (res.status == 409) {
                toast.warning("Already Added to Favourites!", { id: toastId })

            } else {
                toast.error("Failed to add to favorites", { id: toastId });

            }
            throw new Error(`Server responded with ${res.status}`);
        }

        toast.success("Bookmarked successfully!", { id: toastId });
    } catch (error) {
        console.error("Error adding to favorites:", error);
    }
}


