import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { loadAllLines } from '../util/line';
import { LandingView } from './LandingView';
import { StudyViewBoard } from './StudyViewBoard';
import { StudyViewCatalog } from './StudyViewCatalog';
import { StudyViewLineCatalog } from './StudyViewLineCatalog';
import { TrainerCatalogView } from './TrainerCatalogView';
import { TrainerBoardView } from './TrainerBoardView';

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
        element: <TrainerCatalogView allLines={allLines} />,
    },
    {
        path: "/trainer/:id",
        element: <TrainerBoardView allLines={allLines} />,
    },
    {
        path: "/trainer/:id/:variation_id",
        element: <TrainerBoardView allLines={allLines} />,
    },
]);

export function Router() {
    return (
        <RouterProvider router={router} />
    );
}
