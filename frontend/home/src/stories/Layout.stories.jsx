import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import Grid from '../components/layout/Grid';
import FlexRow from '../components/layout/FlexRow';
import Stack from '../components/layout/Stack';

export const LayoutDemo = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Container>
        <Section className="border-b border-[var(--border)]">
          <Stack>
            <h1 className="title-page">Page Title (Layout Demo)</h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              This story demonstrates the global layout system components.
            </p>
          </Stack>
        </Section>

        <Section className="border-b border-[var(--border)]">
          <h2 className="title-section mb-6">Grid Columns Demo</h2>
          <Stack>
            <h3 className="">2 Columns (Desktop)</h3>
            <Grid cols={2}>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 1</div>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 2</div>
            </Grid>

            <h3 className="mt-4">3 Columns (Desktop)</h3>
            <Grid cols={3}>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 1</div>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 2</div>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 3</div>
            </Grid>

            <h3 className="mt-4">4 Columns (Desktop)</h3>
            <Grid cols={4}>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 1</div>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 2</div>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 3</div>
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">Col 4</div>
            </Grid>
          </Stack>
        </Section>

        <Section>
          <h2 className="title-section mb-6">FlexRow Demo</h2>
          <FlexRow>
            <div className="flex-1 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <h3>Flex Item 1</h3>
              <p className="text-sm text-[var(--text-muted)]">FlexRow stacks vertically on mobile and horizontally on desktop, keeping consistent gaps.</p>
            </div>
            <div className="flex-1 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <h3>Flex Item 2</h3>
              <p className="text-sm text-[var(--text-muted)]">Perfect for side-by-side elements like text and images, or split panels.</p>
            </div>
          </FlexRow>
        </Section>
      </Container>
    </div>
  );
};
