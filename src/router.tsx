import { lazy } from "react"
import { createBrowserRouter } from "react-router-dom"

const Aero = lazy(() =>
  import("./Aero.tsx").then((module) => ({
    default: module.Aero,
  }))
)

export const router = createBrowserRouter([
  {
    path: "/aero",
    element: <Aero />,
  },
])
