import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  SimpleGrid,
  Image,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";

function Products() {
  const [products, setProducts] = useState([
    {
      id: 3,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
      category: "",
    },
    {
      id: 4,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 5,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 6,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 7,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 8,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 9,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 10,
      name: "Product 3",
      price: 29.9,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 11,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 12,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 13,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 14,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 15,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 16,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },
    {
      id: 17,
      name: "Product 3",
      price: 39.99,
      image: "https://via.placeholder.com/300",
    },

    // Add more mock products as needed
  ]);

  // useEffect to fetch data is removed since we're using mock data now

  return (
    <ChakraProvider>
      <Box p={4}>
        <Heading mb={20}>Product Listing</Heading>

        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 8 }} spacing={30}>
          {products.map((product) => (
            <Box key={product.id} p={4} borderWidth="1px" borderRadius="lg">
              {/* <Image
                src={product.image}
                alt={product.name}
                mb={2}
                w={110}
                h={110}
              /> */}
              <Heading size="md">{product.name}</Heading>
              <Text>$ {product.price}</Text>
              {/* Add more product details as needed */}
              <Button
                fontSize={15}
                padding={1}
                color={"yellow"}
                mt={5}
                type="button"
              >
                Add To cart
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </ChakraProvider>
  );
}

export default Products;
