import { RouterProvider } from "react-router-dom"
import { GlobalStyle } from "./globalStyle"
import { router } from "./router"

function App() {
  return (
    <>
      <GlobalStyle />
      <RouterProvider router={router} />
    </>
  )
}

export default App
