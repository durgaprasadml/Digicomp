import React, { cloneElement, ReactElement } from "react"
import { buttonVariants } from "@heroui/styles"

export default function CustomButton({
	children,
	className = '',
	...props
} ) {
	const generatedClasses = buttonVariants( { ...props } )
	return cloneElement( children, {
		...props,
		className: `${ generatedClasses } button--dc ${ className } ${ children.props.className || '' }`.trim(),
	} )
}
