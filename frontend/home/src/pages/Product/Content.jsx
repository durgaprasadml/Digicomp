import { Table, Card } from '@heroui/react'
import { CustomButton, Section, Stack } from '../../components'

export default function Content({ product }) {
  return (
    <>
      {/* R3: Description */}
      {product.description && (
        <Section>
          <div className="surface surface--default rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <h2 className="title-section">
              <span className="w-1 h-1 bg-accent rounded-full"></span>
              Overview
            </h2>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </Section>
      )}
      {/* R4: Specifications */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <Section>
          <h2 className="title-section">
            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
            Technical Specifications
          </h2>
          <Table className="w-full" shadow="none">
            <Table.ScrollContainer>
              <Table.Content aria-label="Technical Specifications">
                <Table.Header>
                  <Table.Column isRowHeader>Feature</Table.Column>
                  <Table.Column>Specification</Table.Column>
                </Table.Header>
                <Table.Body>
                  {Object.entries(product.attributes).map(([key, values]) => (
                    <Table.Row key={key}>
                      <Table.Cell className="font-semibold w-1/3">{key}</Table.Cell>
                      <Table.Cell className="text-muted w-2/3">{values.join(', ')}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Section>
      )}
      {/* R5: Files */}
      {product.acf && (product.acf.datasheet || product.acf.schematic) && (
        <Section>
          <Stack className="gap-8">
          {product.acf.datasheet && (
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <h2 className="title-section">
                  <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                  Datasheet
                </h2>
                <CustomButton variant="tertiary">
                  <a href={product.acf.datasheet.url} download>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download
                  </a>
                </CustomButton>
              </div>
              {product.acf.datasheet.mime === 'application/pdf' ? (
                <iframe src={product.acf.datasheet.url} className="w-full h-96 md:h-200 border border-border rounded-3xl bg-white shadow-sm" title="Datasheet" />
              ) : (
                <div className="p-12 text-center text-muted border border-dashed border-border rounded-3xl bg-surface">Preview not available</div>
              )}
            </div>
          )}
          {product.acf.schematic && (
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <h2 className="title-section">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  Schematic
                </h2>
                <CustomButton variant="tertiary">
                  <a href={product.acf.schematic.url} download>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download
                  </a>
                </CustomButton>
              </div>
              {product.acf.schematic.mime === 'application/pdf' ? (
                <iframe src={product.acf.schematic.url} className="w-full h-96 md:h-200 border border-border rounded-3xl bg-white shadow-sm" title="Schematic" />
              ) : (
                <Card className="items-center">
                  <img src={product.acf.schematic.url} alt="Schematic" className="max-w-full max-h-full object-contain" />
                </Card>
              )}
            </div>
          )}
          </Stack>
        </Section>
      )}
    </>
  )
}
