import { Section, Stack, Rating } from '../../components'
import { Card, Avatar, Button, Chip } from '@heroui/react'

export default function Reviews({ product }) {
  return (
    <>
      {/* R8: Reviews */}
      <Section id="reviews">
        <div className="flex justify-between items-start">
          <h2 className="title-section">
            <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
            Customer Reviews
            <Chip variant="soft" size="md">
              {product.reviewCount || 0}
            </Chip>
          </h2>
          <Button>Write a Review</Button>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <Stack>
            {product.reviews.map(review => (
              <Card key={review.id}>
                <Card.Header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 py-0 gap-4">
                  <div className="flex gap-3 items-center">
                    <Avatar>
                      <Avatar.Image src={review.avatar} alt="review.author" />
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold">{review.author}</span>
                      <span className="text-xs text-muted mt-0.5">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <Rating rating={review.rating} isReadOnly={true} size="sm" />
                </Card.Header>
                <Card.Content className="p-4">
                  <div className="text-muted text-sm leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: review.content }} />
                </Card.Content>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card className="text-center">
            <div className="w-16 h-16 bg-default rounded-full flex items-center justify-center mx-auto text-muted">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-lg font-bold">No reviews yet</h3>
            <p className="text-muted max-w-sm mx-auto">Have you used this product? Be the first to share your experience with other engineers.</p>
          </Card>
        )}
      </Section>
    </>
  )
}
