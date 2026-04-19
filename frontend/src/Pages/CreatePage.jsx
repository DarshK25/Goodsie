import {
  Container,
  VStack,
  Heading,
  useColorModeValue,
  Box,
  Input,
  Button,
  useToast,
  FormControl,
  FormLabel,
  Image,
  Text,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../store/product.js";

const CreatePage = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const toast = useToast();
  const { createProduct } = useProductStore();

  // Handle file selection and show a local preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async () => {
    const { name, price, description } = newProduct;

    if (!name || !price || !description || !imageFile) {
      toast({
        title: "Validation Error",
        description: "All fields including an image file are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);

    // Build FormData so multer-s3 can handle the file
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("image", imageFile);

    const { success, message } = await createProduct(formData);
    setUploading(false);

    if (success) {
      toast({
        title: "Product Added",
        description: "Product image uploaded to S3 and saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Reset form
      setNewProduct({ name: "", price: "", description: "" });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formBg = useColorModeValue("white", "gray.800");

  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        {/* Animated heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            mt={6}
            mb={6}
            zIndex={10}
          >
            Create New Product
          </Heading>
        </motion.div>

        {/* Form Container */}
        <Box w={"full"} bg={formBg} p={6} rounded={"lg"} shadow={"md"}>
          <VStack spacing={4}>
            <Input
              placeholder="Product Name"
              name="name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <Input
              placeholder="Price"
              name="price"
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />
            <Input
              placeholder="Description"
              name="description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />

            {/* ── S3 Image Upload ── */}
            <FormControl>
              <FormLabel fontSize="sm" color="gray.500">
                Product Image
              </FormLabel>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                p={1}
              />
            </FormControl>

            {/* Live preview of selected image */}
            {imagePreview && (
              <Box w="full" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  w="100%"
                  h="180px"
                  objectFit="cover"
                />
                <Text fontSize="xs" color="gray.400" p={1} textAlign="center">
                  Image Preview
                </Text>
              </Box>
            )}

            {/* Submit */}
            <Button
              colorScheme="blue"
              onClick={handleAddProduct}
              w="full"
              isLoading={uploading}
              loadingText="Uploading to S3..."
              _hover={{ bg: "blue.600" }}
            >
              Add New Product
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;
