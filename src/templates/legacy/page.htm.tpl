<!-- legacy webspeed page: {{name}} -->
<!-- todo: html, javascript and speedscript are mixed here by design; details follow -->
<html>
<head>
  <title>{{name}}</title>
  <script language="SpeedScript">
    /* ---- data initialisation (speedscript) ---- */
    define variable l-backend-o as {{backendClass}} no-undo.
    l-backend-o = new {{backendClass}}().
    /* todo: read request parameters (get-value), call l-backend-o:load(...) */
  </script>
  <script type="text/javascript">
    /* ---- frontend logic ---- */
    /* todo: consume values / json rendered by the backend */
{{#each fields}}    var {{name}} = "<%= l-backend-o:{{name}} %>";
{{/each}}  </script>
</head>
<body>
  <!-- ---- markup rendered from backend state ---- -->
{{#each fields}}  <div class="{{name}}"><%= l-backend-o:{{name}} %></div>
{{/each}}
  <script language="SpeedScript">
    /* todo: cleanup */
    if valid-object(l-backend-o) then delete object l-backend-o.
  </script>
</body>
</html>
