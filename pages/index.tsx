import React from 'react'
import { FormControl, InputLabel, Box, Button, Select, MenuItem, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Stack, styled, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField, Toolbar, Typography, LinearProgress } from '@mui/material'
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
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterMoment } from '@mui/x-date-pickers-pro/AdapterMoment';
import { StaticDateRangePicker } from '@mui/x-date-pickers-pro/StaticDateRangePicker';
import { DateRange } from '@mui/x-date-pickers-pro/DateRangePicker';
import moment from 'moment'
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
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [exportShown, setExportShown] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange<moment.Moment>>([null, null]);
  const [marketplace, setMarketplace] = React.useState('all')
  const [deliveryType, setDeliveryType] = React.useState('all')

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
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
        const workBook = XLSX.read(bstr, { type: "binary" })
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
      } catch { }
      finally {
        setLoading(false)
        event.target.value = null
      }
    }
    reader.readAsBinaryString(file)
  }

  const exportFile = async () => {
    setExportShown(false)
    setLoading(true)
    try {
      const response = await axios.post(`/api/orders/filter`, {
        marketplace: marketplace,
        dateRange: dateRange,
        deliveryType
      })
      const orders = response.data.orders.map((item: any) => {
        return {
          'Sàn': item.marketplace,
          'Mã đơn hàng': item.orderId,
          'Mã vẫn đơn': item.orderNumber,
          'Đơn vị vận chuyển': item.shippingSupplier,
          'Trạng thái': item.status,
          'Hạn giao hàng': item.deliveryDueDate,
          'Ngày nhập đơn hàng': item.createdAt,
          'Ngày giao vận chuyển': item.deliveryTime,
        }
      })
      const workBook = XLSX.utils.book_new()
      const workSheet = XLSX.utils.json_to_sheet(orders)
      XLSX.utils.book_append_sheet(workBook, workSheet, 'Export')
      const uint8Array = XLSX.write(workBook, { type: 'array', bookType: 'xlsx'})
      var blob = new Blob([uint8Array], {type:"application/octet-stream"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.download = `Export-${moment().unix()}.xlsx`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
    } catch {}
    finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Dialog open={exportShown} onClose={() => setExportShown(false)} maxWidth={'lg'}>
        <DialogTitle>Xuất dữ liệu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Chọn dữ liệu cần xuất {JSON.stringify(dateRange)}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="demo-simple-select-label">Sàn điện tử</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={marketplace}
              label="Sàn"
              onChange={(event: any) => setMarketplace(event.target.value)}
            >
              <MenuItem value={'all'}>Tất cả</MenuItem>
              <MenuItem value={'Lazada'}>Lazada</MenuItem>
              <MenuItem value={'Shopee'}>Shopee</MenuItem>
              <MenuItem value={'Tiki'}>Tiki</MenuItem>
              <MenuItem value={'Tiktok'}>Tiktok</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Tình trạng đơn</InputLabel>
            <Select
              value={deliveryType}
              label="Tình trạng đơn"
              onChange={(event: any) => setDeliveryType(event.target.value)}
            >
              <MenuItem value={'all'}>Tất cả</MenuItem>
              <MenuItem value={'done'}>Đã giao</MenuItem>
              <MenuItem value={'pending'}>Chưa giao</MenuItem>
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <StaticDateRangePicker
              displayStaticWrapperAs="desktop"
              value={dateRange}
              onChange={(newValue: any) => {
                setDateRange(newValue);
              }}
              renderInput={(startProps: any, endProps: any) => (
                <React.Fragment>
                  <TextField {...startProps} />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} />
                </React.Fragment>
              )}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportShown(false)}>Cancel</Button>
          <Button onClick={() => exportFile()}>Export</Button>
        </DialogActions>
      </Dialog>
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
              <Tab label="Tất cả" value='1' />
              <Tab label="Chờ giao vận chuyển" value='2' />
              <Tab label="Đã giao vận chuyển" value='3' />
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
              rowsPerPageOptions={[10, 30, 100]}
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
    </>
  )
}

export default Home
