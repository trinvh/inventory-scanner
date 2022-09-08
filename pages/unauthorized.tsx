import React, { ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import { NextPageWithLayout } from './_app'

export async function getServerSideProps() {
  return {
    props: {}
  }
}

const UnauthorizedPage: NextPageWithLayout = ({ }) => {
  return <Box>
    <Typography variant="h1">Unauthorized</Typography>
    {/* <Link href="/">Login</Link> */}
  </Box>
}

export default UnauthorizedPage

UnauthorizedPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Box>{page}</Box>
  )
}
