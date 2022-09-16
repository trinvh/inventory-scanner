import { Dialog, DialogTitle, DialogContent, DialogContentText, FormControl, InputLabel, Select, MenuItem, TextField, Box, DialogActions, Button } from '@mui/material';
import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterMoment } from '@mui/x-date-pickers-pro/AdapterMoment';
import { StaticDateRangePicker } from '@mui/x-date-pickers-pro/StaticDateRangePicker';
import { DateRange } from '@mui/x-date-pickers-pro/DateRangePicker';
import axios from 'axios';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { normalizeDateRange } from '../../utility';

interface ExportDialogProps {
  visible: boolean
  close: () => void
}

const ExportDialog = (props: ExportDialogProps) => {
  const [dateRange, setDateRange] = React.useState<DateRange<moment.Moment>>([null, null]);
  const [marketplace, setMarketplace] = React.useState('all')
  const [shippingSupplier, setShippingSupplier] = React.useState('all')
  const [deliveryType, setDeliveryType] = React.useState('all')
  const [loading, setLoading] = React.useState(false)

  const exportFile = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`/api/orders/filter`, {
        marketplace: marketplace,
        shippingSupplier: shippingSupplier,
        dateRange: normalizeDateRange(dateRange),
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
      const uint8Array = XLSX.write(workBook, { type: 'array', bookType: 'xlsx' })
      var blob = new Blob([uint8Array], { type: "application/octet-stream" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.download = `Export-${moment().unix()}.xlsx`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
    } catch { }
    finally {
      setLoading(false)
      props.close()
    }
  }

  return (
    <Dialog open={props.visible} onClose={() => props.close()} maxWidth={'lg'}>
      <DialogTitle>Xuất dữ liệu</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Chọn dữ liệu cần xuất
        </DialogContentText>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.close()}>Cancel</Button>
        <Button disabled={loading} onClick={() => exportFile()}>Export</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
