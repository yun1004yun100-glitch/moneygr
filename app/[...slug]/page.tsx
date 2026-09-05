import Home from '../page';

export default function RoutedPage({params}:{params:{slug:string[]}}){
  return <Home initialPath={`/${params.slug.join('/')}`}/>;
}
