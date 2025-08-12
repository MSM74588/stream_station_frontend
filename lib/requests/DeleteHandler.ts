import { toast } from "sonner";

export async function DeleteHandler({ server_url, cell_id }: { server_url: string; cell_id: string; }) {
    const url = `${server_url}?id=${cell_id}`;
    const toast_ID = toast.loading("Deleting Record")

    try {
        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
        }
        toast.success("Deleted", { id: toast_ID });
        return await response.json();
    } catch (error) {
        console.error('Error deleting:', error);
        toast.error(`${error instanceof Error ? error.message : String(error)}`, { id: toast_ID })
        throw error;
    }
}
