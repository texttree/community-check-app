import Loader from '@/app/components/Loader'

const LoadingBlock = () => (
  <div className="pt-4">
    <div className="px-0 py-0 md:px-4 md:py-1">
      <Loader line={['w-48 h-5 mb-4 bg-neutral-300 md:bg-bright-gray']} />
      <Loader line={['w-36 h-3 mb-6 md:mb-0 bg-neutral-200 md:bg-bright-gray']} />
    </div>
    <div className="p-4 mb-4 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-full h-px my-1 md:mb-4 hidden md:block',
          'w-10/12 h-5 my-1 md:my-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
    <div className="px-4 pt-4 pb-4 mb-4 md:px-4 md:pt-0 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-full h-5 my-1',
          'w-1/2 h-5 mt-1 mb-1 md:mb-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
    <div className="px-4 pt-4 pb-4 mb-4 md:px-4 md:pt-0 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-11/12 h-5 my-1',
          'w-2/3 h-5 mt-1 mb-1 md:mb-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
    <div className="px-4 pt-4 pb-4 mb-4 md:px-4 md:pt-0 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-9/12 h-5 mt-1 mb-1 md:mb-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
    <div className="px-4 pt-4 pb-4 mb-4 md:px-4 md:pt-0 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-full h-5 mt-1 mb-1 md:mb-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
    <div className="px-4 pt-4 pb-4 mb-4 md:px-4 md:pt-0 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-full h-5 my-1',
          'w-1/2 h-5 mt-1 mb-1 md:mb-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
    <div className="px-4 pt-4 pb-4 mb-4 md:px-4 md:pt-0 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-11/12 h-5 my-1',
          'w-2/3 h-5 mt-1 mb-1 md:mb-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
    <div className="px-4 pt-4 pb-4 mb-4 md:px-4 md:pt-0 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-9/12 h-5 mt-1 mb-1 md:mb-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
    <div className="px-4 pt-4 pb-4 mb-4 md:px-4 md:pt-0 md:mb-0 bg-white md:bg-inherit rounded-2xl md:rounded-none mx-auto text-center max-w-6xl">
      <Loader
        line={[
          'w-full h-5 mt-1 mb-1 md:mb-5',
          'w-full h-px my-1 md:mt-4 hidden md:block',
        ]}
      />
    </div>
  </div>
)

export default LoadingBlock
