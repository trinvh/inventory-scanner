import React from 'react'
import { FormControl, InputLabel, Box, Button, Select, MenuItem, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Stack, styled, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField, Toolbar, Typography, LinearProgress, NoSsr, Badge, Snackbar, Alert } from '@mui/material'
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
import { DataGrid } from '@mui/x-data-grid';
import { TabContext, TabPanel, TabList } from '@mui/lab'

import moment from 'moment'
import ExportDialog from '../components/dialogs/ExportDialog'
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
    field: 'createdAt',
    headerName: 'Ngày nhập đơn hàng',
    width: 100
  },
  {
    field: 'deliveryTime',
    headerName: 'Ngày giao vận chuyển',
    width: 100
  },

]
interface ServerProps {
}

interface PaginationData {
  pagination: {
    total: number
    page: number
    limit: number
  }
  items: any[]
}
export async function getServerSideProps() {
  return {
    props: {}
  }
}

const Home: NextPage<ServerProps> = ({ }) => {

  const [tab, setTab] = React.useState('1')
  const [loading, setLoading] = React.useState(false)
  const [dataLoading, setDataLoading] = React.useState(false)
  const [data, setData] = React.useState<PaginationData>()
  const [page, setPage] = React.useState(1)
  const [statistics, setStatistics] = React.useState({ total: 0, pending: 0, delivered: 0 })
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [exportShown, setExportShown] = React.useState(false)
  const [isSnackbarShown, setIsSnackbarShown] = React.useState(false)
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success')
  const [snackbarMessage, setSnackbarMessage] = React.useState('')


  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(+event.target.value);
    setPage(1);
  };

  const loadData = React.useCallback(async () => {
    let type = 'all'
    if (tab === '2') {
      type = 'pending'
    } else if (tab === '3') {
      type = 'delivered'
    }
    setDataLoading(true)
    try {
      const result = await axios.get(`/api/orders?page=${page}&limit=${rowsPerPage}&type=${type}`)
      setData(result.data)
      const statisticsResult = await axios.get(`/api/orders/statistics`)
      setStatistics(statisticsResult.data)
    } catch { }
    finally {
      setDataLoading(false)
    }
  }, [page, rowsPerPage, tab])

  React.useEffect(() => {
    loadData()
  }, [tab, page, rowsPerPage])

  const handleTabChange = (event: any, newValue: any) => {
    setTab(newValue);
  };

  const onFileChange = async (event: any) => {
    setLoading(true)
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = async (e: any) => {
      try {
        const bstr = e.target.result
        const workBook = XLSX.read(bstr, { type: "binary", cellDates: true })
        const workSheet = workBook.Sheets[workBook.SheetNames[0]]
        const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 })
        const data = fileData.slice(1)
        const orders = _.map(data, (item: any) => ({
          marketplace: item[0],
          orderId: String(item[1]),
          orderNumber: String(item[2]),
          shippingSupplier: item[3],
          deliveryDueDate: item[4],
          status: item[5]
        }))
        await axios.post('/api/orders', {
          orders: orders
        })
        await loadData()
        setSnackbarType('success')
        setSnackbarMessage('Import thành công')
      } catch (e: any) {
        const message = e.response?.data?.message ?? e.message
        setSnackbarType('error')
        setSnackbarMessage(message)
      }
      finally {
        setLoading(false)
        setIsSnackbarShown(true)
        event.target.value = null
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <NoSsr>
      <LoadingOverlay visible={loading} />
      <Snackbar
        open={isSnackbarShown}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarShown(false)}
      >
        <Alert onClose={() => setIsSnackbarShown(false)} severity={snackbarType} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
      <ExportDialog visible={exportShown} close={() => setExportShown(false)} />
      <Head>
        <title>Danh sách đơn hàng</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Danh sách đơn hàng" />
      {dataLoading && <LinearProgress />}
      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2} sx={{ m: 2 }}>
        <Button variant="contained" onClick={() => setExportShown(true)}>
          Xuất file
        </Button>
        <Button variant="contained" component="label">
          Nhập file
          <input hidden multiple={false} type="file" onChange={onFileChange} />
        </Button>
      </Stack>
      <Box sx={{ mx: 2 }}>
        <TabContext value={tab}>
          <Box>
            <TabList onChange={handleTabChange}>
              <Tab label={<Stack direction="row">
                <Typography>Tất cả</Typography>
                <Chip sx={{ ml: 1 }} size="small" label={statistics.total} />
              </Stack>} value='1' />
              <Tab label={<Stack direction="row">
                <Typography>Chờ giao vận chuyển</Typography>
                <Chip sx={{ ml: 1 }} size="small" label={statistics.pending} />
              </Stack>} value='2' />
              <Tab label={<Stack direction="row">
                <Typography>Đã giao vận chuyển</Typography>
                <Chip sx={{ ml: 1 }} size="small" label={statistics.delivered} />
              </Stack>} value='3' />
            </TabList>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {columns.map(col => {
                    return <TableCell key={col.field}>{col.headerName}</TableCell>
                  })}

                </TableRow>
              </TableHead>

              <TableBody>
                {data?.items?.map((row: any) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.marketplace}
                    </TableCell>
                    <TableCell align="left">{row.orderId}</TableCell>
                    <TableCell align="left">{row.orderNumber}</TableCell>
                    <TableCell align="left">{row.shippingSupplier}</TableCell>
                    <TableCell align="left">{moment(row.deliveryDueDate).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell align="left">{row.status}</TableCell>
                    <TableCell align="left">{moment(row.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell align="left">{moment(row.deliveryTime).isValid() ? moment(row.deliveryTime).format('YYYY-MM-DD HH:mm') : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[1, 10, 30, 100]}
              component="div"
              count={data?.pagination?.total ?? 0}
              rowsPerPage={data?.pagination?.limit ?? rowsPerPage}
              page={page - 1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </TabContext>
      </Box>
    </NoSsr>
  )
}

export const config = {
  unstable_includeFiles: [
    'node_modules/next/dist/compiled/@edge-runtime/primitives/**/*.+(js|json)',
  ],
}

export default Home
