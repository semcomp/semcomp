import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Routes";
import './index.css'

window.addEventListener('error', (e) => console.error("GLOBAL ERROR:", e.error));

createRoot(document.getElementById('root')!).render(
    // agora o router é renderizado ao inves do app diretamente
    <StrictMode>
      <RouterProvider router={router}></RouterProvider>
    </StrictMode>
)
