import { Backdrop, CircularProgress } from "@mui/material"

interface IProps {
  visible: boolean;
}

const LoadingOverlay = (props: IProps) => {
  return <Backdrop
    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={props.visible}
  >
    <CircularProgress color="inherit" />
  </Backdrop>
}

export default LoadingOverlay