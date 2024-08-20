import React, { useEffect, useState } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";
import Home from "./views/Home";
import history from "./utils/history";
import "./App.css";
import initFontAwesome from "./utils/initFontAwesome";
// import Register from "./components/user-auth/register";
// import ProfilePage from "./components/user-auth/profile";
import Login from "./components/login";
import Signup from "./components/signup";
initFontAwesome();

const App = () => {
  const [loggedInUser, setLoggedInUser] = useState();
  const [count, setCount] = useState(0);

  useEffect(() => {
    // const loggedUser = appUser() ? appUser() : user;
    // if (loggedUser) {
    //   setLoggedInUser(loggedUser);
    //   setCartItemsCount();
    //   history.push("/home");
    // } else {
    //   history.push("/login");
    // }
  }, []);

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/home" exact component={Home} />
            <Route path="/login" exact component={Login} />
            <Route path="/sign-up" exact component={Signup} />
            {/* <Route path="/profile" exact component={ProfilePage} /> */}
            {/* <Route path="/external-api" exact component={ExternalApi} /> */}
            {/* <Route path="/add-product" exact component={AddProduct} /> */}

            {/* <Route
              path="/cart"
              render={(props) => (
                <Cart
                  {...props}
                  {...props}
                  reusable={true}
                  updateCount={updateCount}
                />
              )}
            /> */}
            {/* <Route path="/checkout" exact component={Checkout} />
            <Route path="/test" exact component={MyComponent} />
            <Route path="/order-submitted" exact component={OrderSubmitted} />
            <Route path="/events" exact component={Events} /> */}
          </Switch>
        </Container>
      </div>
    </Router>
  );
};

export default App;
