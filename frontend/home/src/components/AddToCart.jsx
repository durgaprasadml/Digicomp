import { useState } from 'react'
import { Button } from '@heroui/react'
import { CustomButton } from '.'
import { CartStore } from '../stores/CartStore'

export default function AddToCart( {
	handleAdd,
	variant='outline',
	size='md',
	className='',
	inStock=true,
	imgRef,
	qty=1,
} ) {
	const [ added, setAdded ] = useState(false)
	const { cartRef } = CartStore.use()
	const animate = () => {
		if ( ! imgRef.current || ! cartRef?.current ) return

		const imgRect = imgRef.current.getBoundingClientRect()
		const cartRect = cartRef.current.getBoundingClientRect()
		const flyingImg = imgRef.current.cloneNode(true)

		const startX = imgRect.left + imgRect.width / 2
		const startY = imgRect.top + imgRect.height / 2
		const endX = cartRect.left + cartRect.width / 2
		const endY = cartRect.top + cartRect.height / 2

		const controlX = (startX + endX) / 2
		const controlY = Math.min(startY, endY) - 50 // raise curve

		const time = Math.max(Math.floor(Math.hypot(endX - startX, endY - startY)*0.6), 600)

		Object.assign( flyingImg.style, {
			position: "fixed",
			left: "0px",
			top: "0px",
			width: `${imgRect.width}px`,
			height: `${imgRect.height}px`,
			zIndex: 9999,
			pointerEvents: "none",
			opacity: 0.8,

			offsetPath: `path("M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}")`,
			offsetDistance: "0%",
			offsetRotate: "0deg",
			offsetAnchor: "50% 50%",

			transform: "scale(1)",
			transition: `offset-distance ${time}ms, transform ${time}ms, opacity ${time}ms`,
		} )

		document.body.appendChild( flyingImg )

		requestAnimationFrame( () => {
			flyingImg.style.offsetDistance = '100%'
			flyingImg.style.transform = `scale(${30 / imgRect.width})`
			flyingImg.style.opacity = '0.2'
		} )

		flyingImg.addEventListener( 'transitionend', () => flyingImg.remove(), { once: true } )
	}
	const handleClick = () => {
		handleAdd()
		setAdded(true)
		setTimeout( () => setAdded(false), 1500 )

		animate()
		let ct = 0
		const iId = setInterval( () => {
			ct++;
			if (qty === ct || 5 === ct) { clearInterval( iId ); return }
			animate()
		}, 100)
	}
	return (
		<CustomButton
			variant={ variant }
			size={ size }
		>
			<button
				aria-label="Add to Cart"
				onClick={ handleClick }
				className={ `w-full font-semibold pointer-events-auto${ added ? ' bg-(--color-success-soft-hover) text-foreground' : '' } ${ className }` }
				disabled={ ! inStock }
			>
			{ added ? (
			<>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="20 6 9 17 4 12" />
				</svg>
				Added
			</>
			) : (
			<>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="12" y1="10" x2="12" y2="18" />
					<line x1="8" y1="14" x2="16" y2="14" />
				</svg>
				{ inStock ? 'Add To Cart' : 'Out of Stock' }
			</>
			) }
			</button>
		</CustomButton>
	)
}
