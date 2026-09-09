import Home from '../page';

export default function RoutedPage({params, searchParams}:{params:{slug:string[]}; searchParams?: Record<string, string>}){
  const query = searchParams && Object.keys(searchParams).length ? '?' + new URLSearchParams(searchParams).toString() : '';
  return <Home initialPath={`/${params.slug.join('/')}${query}`}/>;
}

