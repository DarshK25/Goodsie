import {
  Box,
  Heading,
  HStack,
  Image,
  useColorModeValue,
  Text,
  IconButton,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Input,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Badge,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useProductStore } from "../store/product.js";
import { useDisclosure } from "@chakra-ui/react";
import { useState, useRef } from "react";

const ProductCard = ({ product }) => {
  const [updatedProduct, setUpdatedProduct] = useState({
    name: product.name,
    price: product.price,
    description: product.description,
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { deleteProduct, updateProduct: updateProductInStore } = useProductStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDeleteProduct = async (pid) => {
    const { success, message } = await deleteProduct(pid);
    toast({
      title: success ? "Success" : "Error",
      description: message,
      status: success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateProduct = async (pid) => {
    setSaving(true);

    // Build FormData — send file if chosen, else keep existing image URL
    const formData = new FormData();
    formData.append("name", updatedProduct.name);
    formData.append("price", updatedProduct.price);
    formData.append("description", updatedProduct.description);
    if (newImageFile) {
      formData.append("image", newImageFile);
    } else {
      formData.append("image", product.image); // keep existing S3 URL
    }

    const { success, message } = await updateProductInStore(pid, formData);
    setSaving(false);

    toast({
      title: success ? "Updated Successfully" : "Error",
      description: message,
      status: success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });

    if (success) {
      setNewImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    }
  };

  // Detect whether current image is an S3-hosted image
  const isS3Image = product.image && product.image.includes("amazonaws.com");

  return (
    <Box
      shadow={"lg"}
      rounded={"lg"}
      overflow={"hidden"}
      transition={"all 0.2s"}
      _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
      bg={bg}
    >
      <Box position="relative">
        <Image src={product.image} alt={product.name} w={"100%"} h={"200px"} objectFit={"cover"} />
        {isS3Image && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme="orange"
            fontSize="0.65em"
            borderRadius="md"
            px={2}
          >
            ☁ Amazon S3
          </Badge>
        )}
      </Box>

      <Box p={4}>
        <Heading size={"md"}>{product.name}</Heading>
        <Text color={textColor}>{product.description}</Text>
        <HStack mt={4} justifyContent={"space-between"} alignItems={"center"} spacing={4}>
          <Text fontWeight={"bold"} fontSize={"xl"} color={textColor}>
            ${product.price}
          </Text>
          <HStack spacing={2}>
            <IconButton icon={<EditIcon />} colorScheme="blue" onClick={onOpen} aria-label="Edit product" />
            <IconButton
              icon={<DeleteIcon />}
              onClick={() => handleDeleteProduct(product._id)}
              colorScheme="red"
              aria-label="Delete product"
            />
          </HStack>
        </HStack>
      </Box>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Name"
                value={updatedProduct.name}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
              />
              <Input
                placeholder="Price"
                type="number"
                value={updatedProduct.price}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={updatedProduct.description}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
              />

              {/* Current image */}
              <Box w="full">
                <Text fontSize="xs" color="gray.400" mb={1}>Current image:</Text>
                <Image
                  src={product.image}
                  alt={product.name}
                  w="full"
                  h="120px"
                  objectFit="cover"
                  borderRadius="md"
                />
              </Box>

              {/* Replace image via file upload */}
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">
                  Replace image (optional — uploads to S3)
                </FormLabel>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  p={1}
                />
              </FormControl>

              {imagePreview && (
                <Box w="full" borderRadius="md" overflow="hidden">
                  <Image src={imagePreview} alt="New preview" w="full" h="120px" objectFit="cover" />
                  <Text fontSize="xs" color="gray.400" p={1} textAlign="center">New image preview</Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme={"blue"}
              mr={3}
              onClick={() => handleUpdateProduct(product._id)}
              isLoading={saving}
              loadingText="Saving..."
            >
              Update
            </Button>
            <Button variant={"ghost"} onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductCard;
