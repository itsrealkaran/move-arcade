import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";
import Home from "./pages/Home";
import store from "./store";
import { Provider } from "react-redux";
import Landing from "./pages/landing";
import { WalletProvider } from "./lib/context/wallet-context";
import { Toaster } from "./components/ui/sonner";
import Stack from "@/Stacks.tsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing />,
    },
    {
      path: "/whack-a-penguin",
      element: <Home />,
    },
    {
      path: "/stack",
      element: <Stack />,
    },
    {
      path: "/leaderboard",
      element: <Leaderboard />,
    },
  ]);

  return (
    <Provider store={store}>
      <WalletProvider>
        <RouterProvider router={router} />
      </WalletProvider>
      <Toaster />
    </Provider>
  );
}

export default App;
