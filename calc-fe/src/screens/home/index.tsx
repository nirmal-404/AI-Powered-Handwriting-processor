import { ColorSwatch, Group } from '@mantine/core'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState, useCallback } from 'react'
import axios from 'axios'
import Draggable from 'react-draggable'
import { SWATCHES } from '@/constants'

interface GeneratedResult {
  expression: string
  answer: string
}

interface Response {
  expr: string
  result: string
  assign: boolean
}

export default function Home () {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('rgb(255, 255, 255)')
  const [reset, setReset] = useState(false)
  const [dictOfVars, setDictOfVars] = useState({})
  const [result, setResult] = useState<GeneratedResult>()
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 })
  const [latexExpression, setLatexExpression] = useState<Array<string>>([])

  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub])
      }, 0)
    }
  }, [latexExpression])

  const renderLatexToCanvas = useCallback(
    (expression: string, answer: string) => {
      const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`
      setLatexExpression(prev => [...prev, latex])

      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer)
    }
  }, [result, renderLatexToCanvas])

  useEffect(() => {
    if (reset) {
      resetCanvas()
      setLatexExpression([])
      setResult(undefined)
      setDictOfVars({})
      setReset(false)
    }
  }, [reset])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight - canvas.offsetTop
        ctx.lineCap = 'round'
        ctx.lineWidth = 3
      }
    }

    const script = document.createElement('script')
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ['$', '$'],
            ['\\(', '\\)']
          ]
        }
      })
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const resetCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.background = 'black'
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        setIsDrawing(true)
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = color
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const runRoute = async () => {
    const canvas = canvasRef.current
    console.log(`${import.meta.env.VITE_API_URL}`)
    if (canvas) {
      const response = await axios({
        method: 'post',
        url: `${import.meta.env.VITE_API_URL}/calculate`,
        data: {
          image: canvas.toDataURL('image/png'),
          dict_of_vars: dictOfVars
        }
      })

      const resp = await response.data
      console.log('Response', resp)

      resp.data.forEach((data: Response) => {
        if (data.assign) {
          setDictOfVars(prev => ({
            ...prev,
            [data.expr]: data.result
          }))
        }
      })

      const ctx = canvas.getContext('2d')
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height)
      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4
          if (imageData.data[i + 3] > 0) {
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x)
            maxY = Math.max(maxY, y)
          }
        }
      }

      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      setLatexPosition({ x: centerX, y: centerY })

      resp.data.forEach((data: Response) => {
        setTimeout(() => {
          setResult({
            expression: data.expr,
            answer: data.result
          })
        }, 1000)
      })
    }
  }

  return (
    <div className='relative h-screen'>
      <div className='absolute bottom-0 left-0 w-full z-20 border border-red-200 flex justify-between items-center gap-4 px-6 py-4 bg-gray-900 backdrop-blur-sm'>
        {/* Reset Button */}
        <Button
          onClick={() => setReset(true)}
          className='bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md shadow-sm hover:shadow-red-500/40 transition duration-200'
          variant='default'
        >
          Reset
        </Button>

        {/* Color Swatches */}
        <Group className='flex flex-wrap justify-center gap-2'>
          {SWATCHES.map(swatch => (
            <ColorSwatch
            key={swatch}
            color={swatch}
            onClick={() => setColor(swatch)}
            className={`
              cursor-pointer transition-transform hover:scale-110 rounded-full
              ${color === swatch ? 'ring-2 ring-cyan-400 ring-offset-2' : 'ring-0'}
            `}
            aria-label={`Select color ${swatch}`}
          />
          ))}
        </Group>

        {/* Run Button */}
        <Button
          onClick={runRoute}
          className='bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-md shadow-sm hover:shadow-cyan-500/40 transition duration-200'
          variant='default'
        >
          Run
        </Button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        id='canvas'
        className='absolute inset-0 w-full h-full bg-black'
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />

      {/* LaTeX Expressions */}
      {latexExpression.map((latex, index) => (
        <Draggable
          key={index}
          defaultPosition={latexPosition}
          onStop={(_e, data) => setLatexPosition({ x: data.x, y: data.y })}
        >
          <div className='absolute p-2 bg-zinc-800/80 backdrop-blur-sm text-white rounded shadow-md max-w-xs'>
            <div className='latex-content'>{latex}</div>
          </div>
        </Draggable>
      ))}
    </div>
  )
}
