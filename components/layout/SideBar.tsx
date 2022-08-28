import {
  Drawer as DrawerBase,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
  Stack,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { KeyboardArrowUp } from '@mui/icons-material';
import React, { Fragment } from 'react';
import moment from 'moment';
import Link from 'next/link';
import ViewListIcon from '@mui/icons-material/ViewList';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const MenuContainer = styled(List)(({ theme }) => ({
  padding: 10,
  '.MuiListSubheader-root': {
    display: 'none',
  },
  '.MuiDivider-root': {
    borderColor: '#5C5C5C',
    marginTop: 7,
    marginBottom: 12,
  },
  '.MuiListItemButton-root': {
    borderRadius: 10,
    marginBottom: 10,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      '&.logo': {
        backgroundColor: 'transparent',
      },
      '.MuiTypography-root': {
        color: '#FFF',
      },
    },
  },
  '.MuiListItemButton-root.active': {
    backgroundColor: '#FFF',
    '.MuiTypography-root': {
      color: '#000',
    },
  },
}));

const Drawer = styled(DrawerBase)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.primary.main,
    color: '#C9C9C9',
  },
  '.MuiSvgIcon-root': {
    fill: '#FFF',
  },
}));

const LogoContainer = styled('div')`
  margin: 10px auto;
  text-align: center;
`;

const MenuLink = styled(Link)`

`


const SideBar = () => {
  const [menuAnchor, setMenuAnchor] = React.useState<any>(null);

  const menuOpen = Boolean(menuAnchor);

  const menus = [
    {
      header: 'Ecommerce',
      items: [
        {
          title: 'Đơn hàng',
          link: '/',
          icon: <ViewListIcon />,
          items: []
        },
        {
          title: 'Giao hàng',
          link: '/scan',
          icon: <LocalShippingIcon />,
          items: []
        },
      ]
    }
    ,
  ];

  return (
    <Drawer
      sx={{
        paddingTop: 70,
        width: 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
    // anchor="left"
    >
      <MenuContainer>
        <Link href="/">
          <ListItemButton className="logo">
            <LogoContainer>
              <Typography>LOGO</Typography>
              <Typography variant="body2">TVT Corp</Typography>
            </LogoContainer>
          </ListItemButton>
        </Link>
      </MenuContainer>
      {menus.map((section, index) => (
        <Fragment key={section.header}>
          <MenuContainer
            subheader={<ListSubheader>{section.header}</ListSubheader>}
          >
            {section.items.map((menu: any, index: number) => (
              <MenuLink key={index} href={menu.link}>
                <ListItemButton
                  key={menu.title}
                ><ListItemIcon>
                    {menu.icon}
                  </ListItemIcon>
                  <ListItemText primary={menu.title} /></ListItemButton>
              </MenuLink>
            ))}
            {index < menus.length - 1 && <Divider />}
          </MenuContainer>
        </Fragment>
      ))}
      <Box sx={{ flexGrow: 1 }} />
    </Drawer>
  );
};

export default SideBar;
