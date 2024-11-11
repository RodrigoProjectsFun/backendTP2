import { Route, Routes, Navigate } from "react-router-dom"; // Added Navigate here
import HomePage from "./pages/HomePage";  
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage"; // Import CategoriesPage
import Header from './components/ui/Header';
import { useQuery } from "@apollo/client";
import { GET_AUTHENTICATED_USER } from "./graphql/queries/user.query";
import { Toaster } from "react-hot-toast";
import AssociationPage from "./pages/AssociationPage";

function App() {
  const { loading, data } = useQuery(GET_AUTHENTICATED_USER);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen">
      {data?.authUser && <Header />}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path='/' element={data.authUser ? <HomePage /> : <Navigate to='/login' />} />
          <Route path='/login' element={!data.authUser ? <LoginPage /> : <Navigate to='/' />} />
          <Route path='/signup' element={!data.authUser ? <SignUpPage /> : <Navigate to='/' />} />
          <Route path='/associate' element={<AssociationPage />} />
          <Route path='/product' element={<ProductsPage />} />
          <Route path='/categories' element={<CategoriesPage />} /> {/* Add this line */}
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
