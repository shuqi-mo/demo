import { createBrowserRouter } from "react-router-dom";
import { Analysis } from "../Home/components/Analysis";
import Home from "../Home";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>,
    },
    {
        path: '/analysis',
        element: <Analysis/>
    }
])

export default router