import React from 'react'
import { AppBar, Avatar, Box, Button, Card, CardContent, Checkbox, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemAvatar, ListItemText, NoSsr, Paper, Snackbar, Stack, styled, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField, Toolbar, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Header from '../components/layout/Header'
import * as XLSX from 'xlsx';
import * as _ from 'lodash'
import LoadingOverlay from '../components/LoadingOverlay'
import axios from 'axios'
import useSound from 'use-sound';
import moment from 'moment'
import PrintDialog from '../components/dialogs/PrintDialog'
import { LocalPrintshopTwoTone } from '@mui/icons-material'

const columns = [
  {
    field: 'marketplace',
    headerName: 'Sàn',
    width: 100
  },
  {
    field: 'orderId',
    headerName: 'Mã đơn hàng',
    width: 100
  },
  {
    field: 'orderNumber',
    headerName: 'Mã vận đơn',
    width: 100
  },
  {
    field: 'shippingSupplier',
    headerName: 'Đơn vị vận chuyển',
    width: 100
  },
  {
    field: 'deliveryDueDate',
    headerName: 'Hạn giao hàng',
    width: 100
  },
  {
    field: 'status',
    headerName: 'Trạng thái',
    width: 100
  },
  {
    field: 'deliveryTime',
    headerName: 'Ngày giao vận chuyển',
    width: 100
  },

]

const ColoredRow = styled(TableRow)`
  &.expired {
    .MuiTableCell-body {
      color: red;
    }
  }
`
interface ServerProps {
}


export async function getServerSideProps() {
  return {
    props: {}
  }
}

const ScanPage: NextPage<ServerProps> = ({ }) => {
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<any[]>([])
  const [selectedItems, setSelectedItems] = React.useState<any[]>([])
  const [keyword, setKeyword] = React.useState('')
  const [isSnackbarShown, setIsSnackbarShown] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState('')
  const [isModalShown, setIsModalShown] = React.useState(false)
  const [playError] = useSound('/error.mp3')
  const [playSuccess] = useSound('/success.mp3')
  const [printShown, setPrintShown] = React.useState(false)

  const onFileChange = async (event: any) => {
    setLoading(true)
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = async (e: any) => {
      try {
        const bstr = e.target.result
        const workBook = XLSX.read(bstr, { type: "binary" })
        const workSheet = workBook.Sheets[workBook.SheetNames[0]]
        const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 })
        const data = fileData.slice(1)
        console.log({ data })
        const orders = _.map(data, (item: any) => ({
          marketplace: item[0],
          orderId: item[1],
          orderNumber: item[2],
          shippingSupplier: item[3],
          deliveryDueDate: item[4],
          status: item[5]
        }))
        await axios.post('/api/orders', {
          orders: orders
        })
      } catch { }
      finally {
        setLoading(false)
      }
    }
    reader.readAsBinaryString(file)
  }

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message)
    setIsSnackbarShown(true)
  }

  const handleSearch = async (keyword: string) => {
    if (keyword) {
      try {
        const result = await axios.get(`/api/orders/scan?id=${keyword}`, {})
        setItems([
          result.data,
          ...items
        ])
        playSuccess()
      } catch (error: any) {
        const message = error.response?.data?.message ?? error.message
        if (!axios.isCancel(error)) {
          showSnackbar(message)
          setIsModalShown(true)
          playError()
        }
      } finally {
        setKeyword('')
      }
    }
  }

  const handleKeyDown = async (event: any) => {
    if (event.key === 'Enter') {
      await handleSearch(event.target.value)
    }
  }

  const closeWarningDialog = () => {
    setIsModalShown(false)
  }

  const toggleAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items)
    }
  }

  const isItemSelected = (item: any) => {
    return selectedItems.includes(item)
  }

  const toggleRow = (item: any) => {
    const xor = _.xorBy(selectedItems, [item], 'orderId')
    setSelectedItems(xor)
  }

  return (
    <NoSsr>
      <LoadingOverlay visible={loading} />
      <Snackbar
        open={isSnackbarShown}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarShown(false)}
        message={snackbarMessage}
      />
      <Dialog
        open={isModalShown}
        onClose={closeWarningDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Mã vạch không phù hợp</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{snackbarMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeWarningDialog} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <PrintDialog visible={printShown} close={() => setPrintShown(false)} selectedItems={selectedItems} sessionItems={items} />
      <Head>
        <title>Giao hàng</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Quét mã giao hàng" />
      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2} sx={{ m: 2 }}>
        <Button variant="contained" component="label" onClick={() => setPrintShown(true)}>
          In
        </Button>
        <Button variant="contained" component="label">
          Nhập file
          <input hidden multiple={false} type="file" onChange={onFileChange} />
        </Button>
      </Stack>
      <Box
        sx={{
          width: 500,
          maxWidth: '100%',
        }}
      >

      </Box>
      <Box sx={{ mx: 2 }}>
        <Box>
          <TextField fullWidth label="Quét mã vạch" placeholder="Quét mã vạch cần giao ở đây"
            value={keyword} onChange={(event: any) => setKeyword(event.target.value)} onKeyDown={handleKeyDown}
          />
        </Box>
        <Typography variant="h6" sx={{ mt: 2 }}>Danh sách đơn hàng vừa quét</Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                    checked={selectedItems.length > 0 && selectedItems.length === items.length}
                    onChange={toggleAll}
                    inputProps={{
                      'aria-label': 'select all',
                    }}
                  />
                </TableCell>
                {columns.map(col => {
                  return <TableCell key={col.field}>{col.headerName}</TableCell>
                })}
                <TableCell>Trễ/đúng hạn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row: any) => {
                const isExpired = moment(row.deliveryTime).isAfter(moment(row.deliveryDueDate))
                return <ColoredRow
                  key={row.id}
                  className={isExpired ? 'expired' : ''}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  onClick={() => toggleRow(row)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected(row)}
                      inputProps={{
                        'aria-labelledby': row.orderId,
                      }}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.marketplace}
                  </TableCell>
                  <TableCell align="left">{row.orderId}</TableCell>
                  <TableCell align="left">{row.orderNumber}</TableCell>
                  <TableCell align="left">{row.shippingSupplier}</TableCell>
                  <TableCell align="left">{moment(row.deliveryDueDate).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell align="left">{row.status}</TableCell>
                  <TableCell align="left">{moment(row.deliveryTime).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell align="left">{isExpired ? 'Giao trễ hạn' : 'Giao đúng hạn'}</TableCell>
                </ColoredRow>
              })}
              {items.length === 0 && (<TableRow><TableCell colSpan={8}>Nhấn chuột vào ô Quét mã vạch và bắt đầu quét</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </NoSsr>
  )
}

export default ScanPage
