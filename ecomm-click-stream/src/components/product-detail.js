import React from "react";
import { useParams } from "react-router-dom";
import {
  ChakraProvider,
  Box,
  Image,
  Heading,
  Text,
  Divider,
  Button,
} from "@chakra-ui/react";

function ProductsDetail() {
  const { productId } = useParams();
  // Fetch product details based on productId from your API or data source
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <ChakraProvider>
      <Box p={4}>
        <Image src={product.image} alt={product.name} mb={4} />
        <Heading mb={2}>{product.name}</Heading>
        <Text fontSize="lg" color="gray.600" mb={4}>
          $ {product.price}
        </Text>
        <Divider mb={4} />
        <Text>{product.description}</Text>
        {/* Add more product details as needed */}
        <Button colorScheme="blue" mt={4}>
          Add to Cart
        </Button>
      </Box>
    </ChakraProvider>
  );
}

export default ProductsDetail;
