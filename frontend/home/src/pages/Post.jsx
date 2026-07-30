import { useState, useRef } from 'react'
import { useLocation } from '@typeroute/router'
import { Link } from '@typeroute/router'

import { home } from '../routes'
import { usePageData } from '../stores/PageStore'
import { Avatar, Breadcrumbs, Chip } from "@heroui/react"
import { Container, Section, Stack, FlexRow } from '../components'

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function Product() {
  const { path } = useLocation()
  const post = usePageData(path) || {}

  if ( ! post.ID ) return <div className="p-8 text-center text-muted min-h-[50vh] flex items-center justify-center">Loading page data...</div>

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Home', route: home },
  ]
  if ( post?.post_title ) { breadcrumbItems.push({ label: post.post_title }) }

  const handleAddToCart = async () => {
    await CartStore.addToCart(product.id, qty)
  }

  return (
    <Container className='relative max-w-7xl py-4'>
      { post.head.styles && Object.keys( post.head.styles ).map( k => (
        k.endsWith('inline') ? <style id={k}>{ post.head.styles[ k ] }</style> :
        <link id={ k } rel="stylesheet" href={ post.head.styles[ k ] } />
      ) ) }
      <Section>
        <Stack spacing={6}>
          <Breadcrumbs>
            { breadcrumbItems.map( ( item, index ) => (
              ! item.route ? <Breadcrumbs.Item key={ index } className="pointer-events-none">{ item.label }</Breadcrumbs.Item> :
                <Breadcrumbs.Item key={ index }>
                  <Link to={ item.route } preload="intent">
                    { item.label }
                  </Link>
                </Breadcrumbs.Item>
            ) ) }
          </Breadcrumbs>

          <FlexRow className="flex-row items-center gap-2">
            <h1 className="text-2xl font-semibold">{ post?.post_title || '' }</h1>
          </FlexRow>
          <div className="flex gap-4 text-muted">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <Avatar.Image src={post.author?.avatar} alt={post.author?.name} />
              </Avatar>
              <span>{post.author?.name}</span>
            </div>
            <span className="flex items-center gap-1">
              <CalendarIcon />
              { post?.date }
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon />
              { post?.readTime }
            </span>
            <div className='flex gap-2 items-center'>
            { post?.tags_input.map( tag => (
              <Chip color='accent' size='sm' variant='secondary'>
                <Chip.Label>{ tag }</Chip.Label>
              </Chip>
            ) ) }
            </div>
          </div>
        </Stack>
      </Section>

      <Section dangerouslySetInnerHTML={{ __html: post.html }} className='dc-post'>
      </Section>
    </Container>
  )
}
