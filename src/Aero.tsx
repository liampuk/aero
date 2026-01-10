import { FC, MouseEvent, TouchEvent, useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { useWindowSize } from "./hooks/general"

export const Aero: FC = () => {
  const mouseY = useRef(0)
  const offsetY = useRef(0)

  const [documentWidth, documentHeight] = useWindowSize()
  const portrait = documentWidth < documentHeight * 0.75
  const pixelRatio = window.devicePixelRatio

  const windowWidth = portrait ? documentWidth * 0.9 : documentHeight * 0.8 * 0.8
  const windowHeight = windowWidth * 1.3
  const windowRadius = windowWidth * 0.4
  const windowWidthPixel = windowWidth * pixelRatio
  const windowHeightPixel = windowHeight * pixelRatio
  const windowRadiusPixel = windowRadius * pixelRatio
  const documentWidthPixel = documentWidth * pixelRatio
  const documentHeightPixel = documentHeight * pixelRatio
  const minShadeSize = windowHeight / 13
  const [shadePos, setShadePos] = useState(windowHeight - minShadeSize + 1)

  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  const mouseStart = (e: MouseEvent<Element>) => {
    e.preventDefault()
    mouseY.current = e?.clientY
    document.onmouseup = mouseStop
    document.onmousemove = mouseDrag
  }

  const touchStart = (e: TouchEvent<HTMLDivElement>) => {
    mouseY.current = e?.touches[0].clientY
    document.ontouchend = mouseStop
    document.ontouchmove = elementTouchDrag
  }

  const updateShadePos = () => {
    setShadePos((prev) => {
      if (prev - offsetY.current < 0) {
        return 0
      } else if (prev - offsetY.current > windowHeight - minShadeSize + 1) {
        return windowHeight - minShadeSize + 1
      }
      return prev - offsetY.current
    })
  }

  const mouseDrag = (e: globalThis.MouseEvent) => {
    e.preventDefault()
    offsetY.current = mouseY.current - e.clientY
    mouseY.current = e.clientY
    updateShadePos()
  }

  const elementTouchDrag = (e: globalThis.TouchEvent) => {
    offsetY.current = mouseY.current - e.touches[0].clientY
    mouseY.current = e.touches[0].clientY
    updateShadePos()
  }

  const mouseStop = () => {
    document.onmouseup = null
    document.onmousemove = null
    document.ontouchend = null
    document.ontouchmove = null
  }

  const updateLightProjection = useCallback(() => {
    const canvas = bgCanvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      const width = documentWidthPixel
      const height = documentHeightPixel
      canvas.width = width
      canvas.height = height

      const scale = 1 / 1.2 // ≈0.909
      // const dx = (canvas.width - canvas.width * scale) / 2
      // const dy = (canvas.height - canvas.height * scale) / 2
      // ctx.setTransform(scale, 0, 0, scale, dx, dy)

      if (shadePos === windowHeight - minShadeSize + 1) {
        ctx.rect(0, 0, width, height)
        ctx.fillStyle = "white"
        ctx.fill()
        return
      }

      const getLeftX = () => {
        const h1 = width / 2 - windowWidthPixel / 2 + windowRadiusPixel
        const k1 = height / 2 - windowHeightPixel / 2 + windowRadiusPixel
        const h2 = width / 2 - windowWidthPixel / 2 + windowRadiusPixel
        const k2 = height / 2 + windowHeightPixel / 2 - windowRadiusPixel
        const y = documentHeightPixel / 2 - windowHeightPixel / 2 + (shadePos + minShadeSize) * devicePixelRatio
        let x
        if (y < k1) {
          x = h1 - Math.sqrt(Math.pow(windowRadiusPixel, 2) - Math.pow(k1 - y, 2))
        } else if (y < k2) {
          x = documentWidthPixel / 2 - windowWidthPixel / 2
        } else {
          x = h2 - Math.sqrt(Math.pow(windowRadiusPixel, 2) - Math.pow(y - k2, 2))
        }
        return { x, y }
      }

      const getRightX = () => {
        const h = width / 2 + windowWidthPixel / 2 - windowRadiusPixel
        const k = height / 2 + windowHeightPixel / 2 - windowRadiusPixel
        const y = documentHeightPixel / 2 - windowHeightPixel / 2 + (shadePos + minShadeSize) * devicePixelRatio
        const cornerY = height / 2 + windowHeightPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.sin(315)
        if (y < cornerY) {
          return {
            x: width / 2 + windowWidthPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.cos(315),
            y: height / 2 + windowHeightPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.sin(315),
          }
        } else {
          return { x: h + Math.sqrt(Math.pow(windowRadiusPixel, 2) - Math.pow(k - y, 2)), y }
        }
      }

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(width, 0)
      ctx.lineTo(width, height)

      const scaleHeight = height * scale
      const scaleWidth = width * scale
      const dx = (width - scaleWidth) / 2
      const dy = (height - scaleHeight) / 2
      ctx.setTransform(scale, 0, 0, scale, dx, dy)

      //TODO
      ctx.lineTo(
        width / 2 +
          windowWidthPixel / 2 -
          windowRadiusPixel +
          windowRadiusPixel * Math.cos(315) -
          (height - (height / 2 + windowHeightPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.sin(315))),
        height
      )

      const { x: x1, y: y1 } = getRightX()
      const { x: x2, y: y2 } = getLeftX()

      ctx.lineTo(x1, y1)
      ctx.lineTo(x2, y2)

      ctx.lineTo(
        width / 2 -
          windowWidthPixel / 2 +
          windowRadiusPixel -
          windowRadiusPixel * Math.cos(315) -
          (height - (height / 2 - windowHeightPixel / 2 + windowRadiusPixel - windowRadiusPixel * Math.sin(315))),
        height + shadePos * 2
      )

      ctx.lineTo(0, height)

      ctx.closePath()
      // ctx.fillStyle = "rgb(240, 236, 228)"
      ctx.fillStyle = "white"
      ctx.fill()
    }
  }, [
    documentHeightPixel,
    documentWidthPixel,
    minShadeSize,
    shadePos,
    windowHeight,
    windowHeightPixel,
    windowRadiusPixel,
    windowWidthPixel,
  ])

  // updateLightProjection()

  useEffect(() => {
    updateLightProjection()

    // Workaround for chrome issue: https://issues.chromium.org/issues/328755781
    document.addEventListener("visibilitychange", function () {
      updateLightProjection()
    })
  }, [shadePos, documentWidthPixel, documentHeightPixel, updateLightProjection])

  return (
    <Wrapper>
      <BrightBackground />
      <BackgroundColour />
      <BackgroundCanvas ref={bgCanvasRef} />

      <Window $width={windowWidth} $height={windowHeight} $radius={windowRadius}>
        <Shade $offset={minShadeSize + shadePos} onMouseDown={(e) => mouseStart(e)} onTouchStart={(e) => touchStart(e)}>
          <Text>
            Lift shade during
            <br />
            takeoff and landing
          </Text>
          <ShadePull $margin={minShadeSize / 3 + 2} />
        </Shade>
        <BrightBackground />
        <Background>
          <Clouds autoPlay loop muted playsInline style={{ height: "100%", width: "100%", objectFit: "cover" }}>
            {/* <source src="https://www.commuting.to/videos/clouds.mp4" type="video/mp4" /> */}
            <source src="/aero/clouds2.mp4" type="video/mp4" />
            {/* <source src="https://videos.pexeals.com/video-files/10995726/10995726-uhd_1440_2560_30fps.mp4" type="video/mp4" /> */}
          </Clouds>
        </Background>
        <WindowOverlay $radius={windowRadius} />
      </Window>
      <WindowBorder $width={windowWidth} $height={windowHeight} $radius={windowRadius} />
      <Overlay />
    </Wrapper>
  )
}

const WindowOverlay = styled.div<{ $radius: number }>`
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 9999;
  border-radius: ${({ $radius }) => $radius}px;
  box-shadow: inset 0 0px 80px rgba(0, 0, 0, 0.2);
  pointer-events: none;
`

const WindowBorder = styled.div<{ $width: number; $height: number; $radius: number }>`
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
  border-radius: ${({ $radius }) => $radius}px;
  position: absolute;
  overflow: hidden;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  pointer-events: none;
  border: 1px solid #cacaca;
  outline: 32px solid rgba(127, 127, 127, 0.1);
  filter: blur(1px);
`

const Window = styled.div<{ $width: number; $height: number; $radius: number }>`
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
  border-radius: ${({ $radius }) => $radius}px;
  position: absolute;
  background-color: white;
  overflow: hidden;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  filter: blur(0.5px) drop-shadow(0px 0px 32px rgba(0, 0, 0, 0.4));
  /* opacity: 0.5; */
`

const BackgroundCanvas = styled.canvas`
  height: 120vh;
  width: 120vw;
  margin-left: -5vw;
  margin-top: -5vh;
  position: absolute;
  /* opacity: 0.5; */
  filter: blur(10px);
  inset: 0;
`

const BrightBackground = styled.div`
  background-image: url("hdr.avif");
  background-size: 20000px 20000px;
  height: 100%;
  width: 100%;
  position: absolute;
`

const Wrapper = styled.div`
  width: 110vw;
  height: 110vh;
  margin-left: -5vw;
  margin-top: -5vh;
  position: fixed;

  animation: shake 8s infinite ease-in-out;

  @keyframes shake {
    0% {
      transform: translate(0, 0);
    }
    10% {
      transform: translate(-1px, 1px);
    }
    20% {
      transform: translate(-2px, -1px);
    }
    30% {
      transform: translate(1px, 2px);
    }
    40% {
      transform: translate(1px, -1px);
    }
    50% {
      transform: translate(-1px, 2px);
    }
    60% {
      transform: translate(-2px, 1px);
    }
    70% {
      transform: translate(2px, 1px);
    }
    80% {
      transform: translate(-1px, -1px);
    }
    90% {
      transform: translate(2px, 2px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
`

const Clouds = styled.video`
  height: 85%;
  margin-top: 76px;
  width: 100%;
  object-fit: cover;
  filter: sepia(0.2);

  animation: inverse-shake 8s infinite ease-in-out;

  @keyframes inverse-shake {
    0% {
      transform: translate(0, 0);
    }
    10% {
      transform: translate(2px, -2px);
    }
    20% {
      transform: translate(4px, 2px);
    }
    30% {
      transform: translate(-2px, -4px);
    }
    40% {
      transform: translate(-2px, 2px);
    }
    50% {
      transform: translate(2px, -4px);
    }
    60% {
      transform: translate(4px, -2px);
    }
    70% {
      transform: translate(-4px, -2px);
    }
    80% {
      transform: translate(2px, 2px);
    }
    90% {
      transform: translate(-4px, -4px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
`

const BackgroundColour = styled.div`
  width: 100%;
  height: 100%;
  /* background: linear-gradient(20deg, #a59170 0%, #ff8000 100%); */
  /* background-color: rgb(210 188 131 / 40%); */
  /* background: linear-gradient(235deg, rgba(236, 137, 50, 0.5) 0%, rgb(210 188 131 / 40%) 100%);
  /* background: linear-gradient(201deg, rgb(255 161 0 / 6%) 0%, rgb(120 120 120 / 34%) 100%); */
  background: linear-gradient(231deg, rgb(255 227 179 / 2%) 70%, rgb(79 79 79 / 64%) 100%);
  /* background-color: rgba(255, 184, 0, 0.2); */
  background-size: 65% 100%;
  /* mix-blend-mode: multiply; */
  position: fixed;
  top: 0;
  left: 0;
`

const Shade = styled.div<{ $offset: number }>`
  background-color: #d7d7d7;
  background: linear-gradient(to bottom, #d7d7d7 95%, #bebebe 100%);
  width: 100%;
  position: absolute;
  cursor: grab;
  height: ${({ $offset }) => $offset}px;
  z-index: 1;
  margin-top: -1px;

  box-shadow: 0px 10px 12px rgba(0, 0, 0, 0.2);

  &:active {
    cursor: grabbing;
  }
`

const Text = styled.p`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  padding: 4px;
  border-radius: 4px;
  bottom: 32px;
  font-size: 11px;
  color: #7b7b7b;
  background-color: #e3e3e3;
`

const ShadePull = styled.div<{ $margin: number }>`
  height: 6px;
  width: 30%;
  position: absolute;
  left: 35%;
  bottom: ${({ $margin }) => $margin}px;
  background-color: #c1c1c1;
`

const Background = styled.div`
  height: 110%;
  width: 110%;
  margin-left: -5%;
  margin-top: -5%;
  background: linear-gradient(to top, #dcb697, #9ba5ae, #3e5879, #020b1a);
  position: absolute;
  mix-blend-mode: multiply;
  filter: blur(1px);
`

const Overlay = styled.div`
  z-index: 999;
  animation: 2s steps(2) 0s infinite normal none running noise;
  width: 200vw;
  height: 200vh;
  position: fixed;
  left: -50vw;
  top: -50vh;
  pointer-events: none;
  mix-blend-mode: darken;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' height='100' width='100'%3e%3cfilter id='noise'%3e%3cfeTurbulence type='fractalNoise' baseFrequency='1.0'/%3e%3c/filter%3e%3crect filter='url(%23noise)' width='100%25' height='100%25'/%3e%3c/svg%3e");
  background-size: 120px;
  filter: grayscale(100%);
  opacity: 0.4;
  inset: -20%;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (orientation: portrait) {
    display: none;
  }

  @keyframes noise {
    0% {
      transform: translate3d(0, 2vh, 0);
    }

    10% {
      transform: translate3d(-1vh, -2vh, 0);
    }

    20% {
      transform: translate3d(-4vh, 1vh, 0);
    }

    30% {
      transform: translate3d(4.5vh, -4.5vh, 0);
    }

    40% {
      transform: translate3d(-1vh, 3.5vh, 0);
    }

    50% {
      transform: translate3d(-4.5vh, -2vh, 0);
    }

    60% {
      transform: translate3d(1vh, 3vh, 0);
    }

    70% {
      transform: translate3d(3.5vh, -4vh, 0);
    }

    80% {
      transform: translate3d(-4.5vh, 0.5vh, 0);
    }

    90% {
      transform: translate3d(3vh, -2.5vh, 0);
    }

    to {
      transform: translate3d(-3.5vh, 0, 0);
    }
  }
`
