import { Container } from '../ui/Container'
import { FadeIn } from '../ui/FadeIn'
import { Heading } from '../ui/Heading'
import { Section } from '../ui/Section'
import { Stack } from '../ui/Stack'
import { Text } from '../ui/Text'

export interface HeroProps {
  title: string
  subtitle?: string
  description?: string
}

export function Hero({ title, subtitle, description }: HeroProps) {
  return (
    <Section className="pb-4 pt-12 text-center sm:pt-16 lg:pt-20">
      <Container size="md">
        <Stack gap={4} align="center">
          {subtitle && (
            <FadeIn delay={0}>
              <Text
                variant="label"
                className="text-[var(--color-accent)]"
              >
                {subtitle}
              </Text>
            </FadeIn>
          )}

          <FadeIn delay={0.1}>
            <Heading level={1} variant="display">
              {title}
            </Heading>
          </FadeIn>

          {description && (
            <FadeIn delay={0.2}>
              <Text variant="lead" className="max-w-2xl">
                {description}
              </Text>
            </FadeIn>
          )}
        </Stack>
      </Container>
    </Section>
  )
}
