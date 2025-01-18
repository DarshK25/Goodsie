import { Container, Flex, Text, HStack, Button, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import {IoMoon} from 'react-icons/io5'
import {LuSun} from 'react-icons/lu'
import {CiSquarePlus} from 'react-icons/ci'
const Navbar = () => {
  const {colorMode, toggleColorMode} = useColorMode(); 
  const navigate = useNavigate();
  const handleCreateButtonClick = () => {
    navigate('/create');
  }
  return (
    <Container maxW = {"1140px"} bg={useColorModeValue("gray.100", "gray.900")} > {/*bg = {useColorMode("gray.100, gray.900")}*/ }
      <Flex h = {16} alignItems = {"center"} justifyContent = {"space-between"}
       flexDir = {{
        base: "row", /*base screen, column alignment*/
        sm: "row", /*small screen, row alignment*/
       }}
       >
       <Text
            fontSize={{ base: "22", sm: "28" }}
            fontWeight={"bold"}
            textTransform={"uppercase"}
            textAlign={"center"}
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}
            backgroundColor="gray.100"
            >
          <Link to="/">Product Store 🛒</Link>
        </Text>

        <HStack spacing={2} alignItems={"center"}>
          <Link to = {"/create"}></Link>
          <Button onClick = {() => {handleCreateButtonClick()}}>
            <CiSquarePlus fontSize={25}/>
          </Button>
          <Button onClick={toggleColorMode}>
              {colorMode === 'light' ? <IoMoon/>: <LuSun size={20}/>}
          </Button>
        </HStack>
      </Flex>
    </Container>
    
  )
}

export default Navbar
