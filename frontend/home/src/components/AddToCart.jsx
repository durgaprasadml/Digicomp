import { useState } from 'react'
import { Button } from '@heroui/react'
import { CustomButton } from '.'
import { CartStore } from '../stores/CartStore'
import { animateFlyToTarget } from '../utils/animate'

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
		animateFlyToTarget(imgRef, cartRef)
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
