import {
  Drawer as DrawerBase,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image'
import React, { Fragment } from 'react';
import moment from 'moment';
import Link from 'next/link';
import ViewListIcon from '@mui/icons-material/ViewList';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useRouter } from 'next/router'

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
    '.MuiListItemIcon-root': {
      minWidth: 40
    },
    '.MuiListItemText-root': {
      textTransform: 'uppercase',
    },
    '&:hover, &.selected': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      '&.logo': {
        backgroundColor: 'transparent',
      },
      '.MuiTypography-root': {
        color: '#FFF',
        
      },
    },
  }
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

const MenuLink = styled(Link)``


const SideBar = () => {
  const router = useRouter();
  const currentRoute = router.pathname;

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
    >
      <MenuContainer>
        <Link href="/">
          <ListItemButton className="logo">
            <LogoContainer>
              <Image src="/logo.png" alt="Logo" width={100} height={100} />
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
                  className={currentRoute === menu.link ? 'selected' : ''}
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
