import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import GridBackground from "./components/ui/GridBackground.jsx";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <GridBackground>
          <App />
        </GridBackground>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
