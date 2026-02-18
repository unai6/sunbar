import { ref } from 'vue'
import { GetSunInfoUseCase, type GetSunInfoResult } from '~/application/use-cases/GetSunInfoUseCase'
import { SunCalcAdapter } from '~/infrastructure/adapters/SunCalcAdapter'

export function useSunInfo() {
  // State
  const sunInfo = ref<GetSunInfoResult | null>(null)
  const selectedDateTime = ref<Date>(new Date())
  const currentLocation = ref<{ latitude: number; longitude: number } | null>(null)

  // Create use case
  function createUseCase(): GetSunInfoUseCase {
    const sunCalculator = new SunCalcAdapter()
    return new GetSunInfoUseCase(sunCalculator)
  }

  // Actions
  function updateSunInfo(latitude: number, longitude: number, date?: Date): void {
    try {
      const useCase = createUseCase()
      const datetime = date || selectedDateTime.value

      sunInfo.value = useCase.execute({
        latitude,
        longitude,
        date: datetime
      })

      currentLocation.value = { latitude, longitude }
    } catch {
      // If sun calculation fails (e.g. invalid coordinates), keep previous state
      sunInfo.value = null
    }
  }

  function setDateTime(datetime: Date): void {
    selectedDateTime.value = datetime

    if (currentLocation.value) {
      updateSunInfo(
        currentLocation.value.latitude,
        currentLocation.value.longitude,
        datetime
      )
    }
  }

  return {
    // State
    sunInfo,
    selectedDateTime,

    // Actions
    updateSunInfo,
    setDateTime
  }
}
