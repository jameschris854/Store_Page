import { Box, type BoxProps } from "@mui/material"

export default ({children ,...props}: BoxProps ) => {

    return <Box  width={"auto"} paddingX={{xs:2, sm:4, md:6, lg:0, xl: 0}} {...props} >
        <Box marginX={"auto"} width={{xl: 1400, lg: 1200 ,md: "100%"}} >
            {children}
        </Box>
    </Box>
}