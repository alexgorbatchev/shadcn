import { createRoot } from "react-dom/client";
import { SnapshotGallery } from "./components/SnapshotGallery";

const root = document.getElementById("root");
if (!root) throw new Error("Snapshot gallery root is missing");
createRoot(root).render(<SnapshotGallery />);
