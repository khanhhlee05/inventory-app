'use client'
import { useState, useEffect, useRef } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, InputAdornment, Grid, ThemeProvider, createTheme, CssBaseline, Paper } from '@mui/material'
import { firestore } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { Camera } from "react-camera-pro";
import { imageDetect, generateRecipe } from '@/AI.mjs'

const theme = createTheme({
  palette: {
    primary: {
      main: '#d4a373', // Beige tone for primary
    },
    secondary: {
      main: '#a68b5b', // Darker beige for secondary
    },
    background: {
      default: '#f5f5dc', // Light beige background
      paper: '#fff8e7', // Light beige paper
    },
    text: {
      primary: '#4b3f2f', // Dark brown text
      secondary: '#a68b5b', // Beige text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 800,
      color: '#4b3f2f',
    },
    h5: {
      fontWeight: 600,
      color: '#4b3f2f',
    },
    h6: {
      fontWeight: 600,
      color: '#4b3f2f',
    },
    button: {
      fontWeight: 600,
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [totalNumberOfItems, setQuantity] = useState(1)
  const [myQuery, setQuery] = useState('')
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const camera = useRef(null)
  const [image, setImage] = useState(null)
  const [recipe, setRecipe] = useState("")

  const updateInventory = async (searchQuery = '') => {
    const snapshot = query(collection(firestore, "inventory"))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => inventoryList.push({ name: doc.id, ...doc.data() }))
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i')
      const filteredInventory = inventoryList.filter(item => regex.test(item.name))
      setInventory(filteredInventory)
    } else {
      setInventory(inventoryList)
    }
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }

    await updateInventory()
  }

  const addItem = async (item, numbers) => {
    numbers == 0 ? numbers = 1 : numbers
    item = item.toLowerCase()
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + numbers })
    } else {
      await setDoc(docRef, { quantity: numbers })
    }

    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handlePhotoModalOpen = () => setPhotoModalOpen(true)
  const handlePhotoModalClose = () => setPhotoModalOpen(false)
  const handleSave = async () => {
    if (image) {
      const detectionResult = await imageDetect(image);
      console.log(detectionResult);
      await addItem(detectionResult, 1)
    }
  };

  const handleRecipe = async () => {
    const snapshot = query(collection(firestore, "inventory"))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => inventoryList.push(doc.id))

    const myRecipe = await generateRecipe(inventoryList)
    setRecipe(myRecipe)
    console.log(myRecipe);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack flexDirection="row">
        <Box width="50vw" height="100vh" display="flex" justifyContent={"center"} alignItems="center" gap={2} flexDirection="column" bgcolor="background.default" padding={4}>
          <Modal open={open} onClose={handleClose}>
            <Box position="absolute" top="50%" left="50%" width={400}
              bgcolor="background.paper" border="2px solid #000"
              boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} sx={{ transform: "translate(-50%, -50%)" }} borderRadius={2}>

              <Typography variant="h6">Add Item</Typography>
              <Stack width="100%" direction="row" gap={2}>
                <TextField
                  id="outlined-basic"
                  label="Item"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  InputLabelProps={{
                    shrink: true,
                    required: true,
                  }}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={totalNumberOfItems}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                    required: true,
                  }}
                  InputProps={{
                    inputProps: { min: 1 },
                    endAdornment: <InputAdornment position="end"> </InputAdornment>,
                  }}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    addItem(itemName, totalNumberOfItems)
                    setItemName('')
                    setQuantity(1)
                    handleClose()
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>

          <Modal open={photoModalOpen} onClose={handlePhotoModalClose}>
            <Box position="absolute" top="50%" left="50%" width={950} height={600}
              bgcolor="background.paper" border="2px solid #000"
              boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} sx={{ transform: "translate(-50%, -50%)" }} borderRadius={2}>

              <Typography variant="h4" color="primary" textAlign="center">Take Photo</Typography>
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="secondary">Camera</Typography>
                    <Box
                      width={400}
                      height={300}
                      bgcolor="#e7dec8"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mt={2}
                      borderRadius={2}
                      border="1px solid #a68b5b"
                    >
                      <Camera ref={camera} aspectRatio={4 / 3} />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="secondary">Taken Picture</Typography>
                    <Box
                      width={400}
                      height={300}
                      bgcolor="#e7dec8"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mt={2}
                      borderRadius={2}
                      border="1px solid #a68b5b"
                    >
                      <img
                        src={image}
                        alt="Taken photo"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (camera.current) {
                      setImage(camera.current.takePhoto());
                    }
                  }}
                >
                  Take Photo
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
                <Button variant="contained" color="secondary" onClick={handlePhotoModalClose}>Close</Button>
              </Stack>
            </Box>
          </Modal>

          <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                ADD BY NAME
              </Button>
              <Button variant="contained" color="secondary" onClick={handlePhotoModalOpen}>
                ADD BY PHOTO
              </Button>
            </Stack>
          </Box>

          <Box border="1px solid #a68b5b" width="800px" borderRadius={4} boxShadow={3} bgcolor="background.paper">
            <Box
              width="100%"
              height="100px"
              bgcolor="primary.main"
              alignItems="center"
              justifyContent="center"
              display="flex"
              padding={2}
              sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
            >
              <Typography variant="h2">
                Inventory Items
              </Typography>
            </Box>

            <Box width="100%" display="flex" alignItems="center" justifyContent="center" padding={2}>
              <TextField
                variant='outlined'
                placeholder='Search'
                value={myQuery}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          updateInventory(myQuery)
                        }}
                      >
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Box>

            <Stack width="100%" height="300px" spacing={2} overflow="auto" padding={2}>
              {inventory.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  height="100%"
                  textAlign="center"
                >
                  <Typography variant="h4" color="textSecondary">
                    No items found.
                  </Typography>
                </Box>

              ) : (
                inventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    minHeight="100px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    bgcolor="background.default"
                    padding={2}
                    borderRadius={2}
                    boxShadow={1}
                  >
                    <Typography variant="h5">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="h5">
                      {quantity}
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>
                      Remove
                    </Button>
                  </Box>
                ))
              )}
            </Stack>
          </Box>
        </Box>
        <Box width="50vw" height="100vh" display="flex" justifyContent={"center"} alignItems="center" gap={2} flexDirection="column" bgcolor="background.default" padding={4}>
          <Button variant="contained" color="secondary" onClick={handleRecipe}>
            Generate Recipes
          </Button>
          <Paper
            elevation={3}
            sx={{ width: '100%', padding: 3, bgcolor: 'background.paper', borderRadius: 2 }}
          >
            <Typography variant="h2" gutterBottom>
              Generated Recipe
            </Typography>
            {!recipe ? (
              <Typography variant="h4" color="textSecondary">
                Ready to make something?
              </Typography>
            ) : (
              recipe.split('\n').map((line, index) => (
                <Typography key={index} variant="body1" paragraph>
                  {line}
                </Typography>
              ))
            )}
          </Paper>
        </Box>
      </Stack>
    </ThemeProvider>
  )
}
