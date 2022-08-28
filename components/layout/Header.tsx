import { AppBar, Toolbar, Typography } from "@mui/material"

interface IProps {
  title: string;
}
const Header = (props: IProps) => {
  return <AppBar position="static" sx={{ bgcolor: "#FFF", color: '#000' }}>
    <Toolbar>
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
      >
        {props.title}
      </Typography>
    </Toolbar>
  </AppBar>
}

export default Header