import { createBrowserRouter } from "react-router-dom"
import { Aero } from "./Aero"

export const router = createBrowserRouter([
  {
    path: "/aero",
    element: <Aero />,
  },
  {
    path: "/aero/",
    element: <Aero />,
  },
])
