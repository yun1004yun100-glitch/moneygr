export type WheelTier='normal'|'premium';
export const wheelRewards={
  normal:[3000,5000,10000,20000,30000,50000,100000],
  premium:[15000,20000,30000,50000,100000,300000,1000000],
};
export const wheelWeights={
  normal:[0,657,224,72,31,10,6],
  premium:[451,250,150,80,45,20,4],
};
export function rewardIndex(tier:WheelTier,ticket:number){
  if(!Number.isInteger(ticket)||ticket<0||ticket>=1000)throw new RangeError('Ticket must be 0–999');
  let sum=0;
  for(let i=0;i<wheelWeights[tier].length;i++){sum+=wheelWeights[tier][i];if(ticket<sum)return i;}
  throw new Error('Invalid reward distribution');
}
export function drawRewardIndex(tier:WheelTier){
  const random=new Uint32Array(1);
  // Reject the incomplete range so all 1,000 tickets have equal probability.
  do{crypto.getRandomValues(random);}while(random[0]>=4294967000);
  return rewardIndex(tier,random[0]%1000);
}
