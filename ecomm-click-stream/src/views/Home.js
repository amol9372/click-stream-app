import React, { Fragment, useEffect, useState } from "react";

import Hero from "../components/ui/Hero";
import history from "../utils/history";
import { Center } from "@chakra-ui/react";
import Products from "../components/products";

const Home = () => {
  const [loggedInUser, setLoggedInUser] = useState();

  useEffect(() => {
    // appUser()
    //   .then((user) => {
    //     if (user) {
    //       history.push("/home");
    //     } else {
    //       history.push("/login");
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }, []);

  return (
    <Fragment>
      <Center marginTop={200}>
        {/* <Hero /> */}
        <Products />
        <hr />
      </Center>
    </Fragment>
  );
};

export default Home;
