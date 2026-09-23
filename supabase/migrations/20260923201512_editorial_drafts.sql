-- Optional copy for review by the actual profile owners. Do not infer identity from private media.
update public.profiles set bio = case username
  when 'anaoliveira' then 'Bem-vindos ao meu cantinho no FaceLove. Aqui partilho pequenas histórias, novidades e coleções organizadas por momentos. Algumas publicações são abertas; os álbuns reservados estão disponíveis por convite. · Rascunho editorial'
  when 'emily' then 'Um espaço para reunir fotografias, vídeos e novidades ao meu ritmo. Passe por aqui para acompanhar novas publicações e descobrir coleções reservadas através de um convite. · Rascunho editorial'
  when 'jade' then 'Bem-vindos ao meu Space. Quero dar forma a uma coleção de momentos em fotografia e vídeo, com novas histórias abertas a todos e álbuns para convidados. · Rascunho editorial'
  when 'micaelagomes' then 'Este é o meu espaço para organizar fotografias, vídeos e coleções especiais. Encontre aqui as novidades públicas; cada álbum reservado tem o seu próprio convite. · Rascunho editorial'
  when 'evamartinez' then 'Um lugar para partilhar novas imagens, pequenos relatos e projetos em vídeo. Explore as publicações abertas e acompanhe as próximas coleções do Space. · Rascunho editorial'
  else bio end
where username in ('anaoliveira','emily','jade','micaelagomes','evamartinez') and editorial_draft = true;

insert into public.posts (space_id,caption,visibility,status,published_at)
select s.id,editorial.caption,'public','published',now()-editorial.age * interval '1 day'
from (values
  ('anaoliveira','O Space está a ganhar forma. Em breve haverá novas fotografias e vídeos públicos nesta página. · Publicação provisória',1),
  ('anaoliveira','Os álbuns reservados são organizados por coleção. Se recebeu um convite, pode ativá-lo na área de acesso privado. · Publicação provisória',2),
  ('emily','Estou a preparar as primeiras galerias públicas. Até lá, fique à vontade para explorar o meu Space. · Publicação provisória',1),
  ('emily','Cada álbum terá a sua própria seleção de imagens ou vídeos e um acesso específico. · Publicação provisória',2),
  ('jade','Novas imagens e publicações a caminho. Este espaço vai crescer aos poucos, com tempo para contar cada história. · Publicação provisória',1),
  ('jade','Os conteúdos reservados ficam disponíveis apenas para quem recebe acesso ao álbum correspondente. · Publicação provisória',2),
  ('micaelagomes','Fotografias, vídeos e uma coleção especial têm lugares separados por aqui. Mais novidades em breve. · Publicação provisória',1),
  ('micaelagomes','A cada nova coleção, uma nova forma de partilhar. Passe pelo mural para acompanhar as novidades abertas. · Publicação provisória',2),
  ('evamartinez','O meu Space está a abrir as portas. Em breve publico as primeiras imagens e vídeos abertos. · Publicação provisória',1),
  ('evamartinez','Por aqui, cada álbum privado tem um acesso próprio. As novidades públicas aparecem neste mural. · Publicação provisória',2)
) as editorial(username,caption,age)
join public.profiles p on p.username=editorial.username
join public.spaces s on s.profile_id=p.id;
