import React, { cloneElement, ReactElement } from "react"
import { buttonVariants } from "@heroui/styles"

export default function CustomButton({
	children,
	className = '',
	...props
} ) {
	const generatedClasses = buttonVariants( { ...props } )
	return cloneElement( children, {
		className: `${ generatedClasses } ${ className } ${ children.props.className || '' }`.trim(),
	} )
}
