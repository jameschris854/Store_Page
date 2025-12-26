import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Box } from '@mui/material'

export default function SwiperCarousel() {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
    >
      {[1, 2, 3 ,4 ,5].map((i) => (
        <SwiperSlide key={i}>
          <Box sx={{ height: 600, backgroundColor: 'transparent', position: 'relative', overflow: 'hidden' }}>
            <img
              src={`/storePhotos/${i}.webp`}
              alt={`Slide ${i} blurred`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'blur(20px)',
                transform: 'scale(1.05)',
                zIndex: 0,
                opacity: 0.8,
              }}
            />
            <img
              src={`/storePhotos/${i}.webp`}
              alt={`Slide ${i}`}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                zIndex: 2,
              }}
            />
          </Box>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
