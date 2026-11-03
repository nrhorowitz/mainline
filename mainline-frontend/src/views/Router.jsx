import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { loadAllLines } from '../util/line';
import { LandingView } from './LandingView';
import { StudyViewBoard } from './StudyViewBoard';
import { StudyViewCatalog } from './StudyViewCatalog';
import { StudyViewLineCatalog } from './StudyViewLineCatalog';
import { TrainerView } from './TrainerView';

var allLines = loadAllLines();

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingView allLines={allLines} />,
    },
    {
        path: "/study",
        element: <StudyViewCatalog allLines={allLines} />,
    },
    {
        path: "/study/:path_opening",
        element: <StudyViewLineCatalog allLines={allLines} />,
    },
    {
        path: "/study/:path_opening/:path_line",
        element: <StudyViewBoard allLines={allLines} />,
    },
    {
        path: "/trainer",
        element: <TrainerView allLines={allLines} />,
    },
]);

export function Router() {
    return (
        <RouterProvider router={router} />
    );
}
