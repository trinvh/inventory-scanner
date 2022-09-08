import { Dialog, DialogTitle, DialogContent, DialogContentText, FormControl, InputLabel, Select, MenuItem, TextField, Box, DialogActions, Button, ToggleButtonGroup, ToggleButton, Typography, styled } from '@mui/material';
import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterMoment } from '@mui/x-date-pickers-pro/AdapterMoment';
import { StaticDateRangePicker } from '@mui/x-date-pickers-pro/StaticDateRangePicker';
import { DateRange } from '@mui/x-date-pickers-pro/DateRangePicker';
import axios from 'axios';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';

const PrintTable = styled('table')`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #555;
  tr.expired {
    color: red;
  }
  tr, td {
    padding: 3px 10px;
    line-height: 1.2;
    border: 1px solid #555;
  }
`

const pageStyle = `
  @page {
    size: landscape;
    margin: 10px 10px 10px 10px !important;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;

interface PrintDialogProps {
  visible: boolean
  close: () => void
  selectedItems: any[]
  sessionItems: any[]
}

const PrintDialog = (props: PrintDialogProps) => {
  const printRef = React.useRef<HTMLDivElement>(null)
  const [dateRange, setDateRange] = React.useState<DateRange<moment.Moment>>([null, null]);
  const [marketplace, setMarketplace] = React.useState('all')
  const [shippingSupplier, setShippingSupplier] = React.useState('all')
  const [deliveryType, setDeliveryType] = React.useState('all')
  const [loading, setLoading] = React.useState(false)
  const [range, setRange] = React.useState<'selected' | 'session' | 'custom'>('selected')
  const [items, setItems] = React.useState<any[]>([])

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'In đơn đã quét',
    onBeforeGetContent: async () => await new Promise((resolve) => setTimeout(() => resolve(true), 100)),
    pageStyle: pageStyle
  });

  React.useEffect(() => {
    if (range === 'selected') {
      setItems(props.selectedItems)
    } else if (range === 'session') {
      setItems(props.sessionItems)
    }
  }, [range, props.selectedItems, props.sessionItems])

  const exportFile = async () => {
    setLoading(true)
    try {
      if (range === 'custom') {
        const response = await axios.post(`/api/orders/filter`, {
          marketplace: marketplace,
          dateRange: dateRange,
          deliveryType
        })
        setItems(response.data.orders)
      }
    } catch { }
    finally {
      setLoading(false)
      handlePrint()
      // props.close()
    }
  }

  return (
    <Dialog open={props.visible} onClose={() => props.close()} maxWidth={'lg'}>
      <DialogTitle>In dữ liệu đã quét</DialogTitle>
      <DialogContent>
        <ToggleButtonGroup
          value={range}
          color="primary"
          exclusive
          onChange={(event, value) => {
            if (value) {
              setRange(value)
            }
          }}
          aria-label="Print range"
        >
          <ToggleButton value="selected">
            <Typography>Đang chọn</Typography>
          </ToggleButton>
          <ToggleButton value="session">
            <Typography>Phiên hiện tại</Typography>
          </ToggleButton>
          <ToggleButton value="custom">
            <Typography>Tùy chỉnh</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
        {range === 'custom' && <>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Sàn điện tử</InputLabel>
            <Select
              value={marketplace}
              size="small"
              label="Sàn điện tử"
              onChange={(event: any) => setMarketplace(event.target.value)}
            >
              <MenuItem value={'all'}>Tất cả</MenuItem>
              <MenuItem value={'Lazada'}>Lazada</MenuItem>
              <MenuItem value={'Shopee'}>Shopee</MenuItem>
              <MenuItem value={'Tiki'}>Tiki</MenuItem>
              <MenuItem value={'Tiktok'}>Tiktok</MenuItem>
              <MenuItem value={'Khác'}>Khác</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Đơn vị vận chuyển</InputLabel>
            <Select
              value={shippingSupplier}
              size="small"
              label="Đơn vị vận chuyển"
              onChange={(event: any) => setShippingSupplier(event.target.value)}
            >
              <MenuItem value={'all'}>Tất cả</MenuItem>
              <MenuItem value={'Shopee Xpress'}>Shopee Xpress</MenuItem>
              <MenuItem value={'LEX'}>LEX</MenuItem>
              <MenuItem value={'Ninja Van'}>Ninja Van</MenuItem>
              <MenuItem value={'J&T'}>J&T</MenuItem>
              <MenuItem value={'GHN'}>GHN</MenuItem>
              <MenuItem value={'GHTK'}>GHTK</MenuItem>
              <MenuItem value={'Viettel'}>Viettel</MenuItem>
              <MenuItem value={'VNPT'}>VNPT</MenuItem>
              <MenuItem value={'Khác'}>Khác</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Tình trạng đơn</InputLabel>
            <Select
              value={deliveryType}
              size="small"
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
        </>}
        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            <PrintTable>
              <tr>
                <th>Sàn</th>
                <th>Mã đơn hàng</th>
                <th>Mã vận đơn</th>
                <th>Vận chuyển</th>
                <th>Hạn giao hàng</th>
                <th>Trạng thái</th>
                <th>Ngày giao</th>
                <th>Trễ/Đúng hạn</th>
              </tr>
              {items.map((item: any) => {
                const isExpired = moment(item.deliveryTime).isAfter(moment(item.deliveryDueDate))
                return <tr
                  key={item.id}
                  className={isExpired ? 'expired' : ''}
                >
                  <td>
                    {item.marketplace}
                  </td>
                  <td align="left">{item.orderId}</td>
                  <td align="left">{item.orderNumber}</td>
                  <td align="left">{item.shippingSupplier}</td>
                  <td align="left">{moment(item.deliveryDueDate).format('YYYY-MM-DD HH:mm')}</td>
                  <td align="left">{item.status}</td>
                  <td align="left">{moment(item.deliveryTime).isValid() ? moment(item.deliveryTime).format('YYYY-MM-DD HH:mm') : ''}</td>
                  <td align="left">{isExpired ? 'Giao trễ hạn' : 'Giao đúng hạn'}</td>
                </tr>
              })}

            </PrintTable>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.close()}>Cancel</Button>
        <Button disabled={loading} onClick={() => exportFile()}>Export</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintDialog;
